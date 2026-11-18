import { randomUUID } from 'node:crypto';
import { alturaJogador, avancar, CORES, comodo, comodoAoAbrir, interage, livre, pontosInicio, portaAoAlcance,
  portas, velocidadeJogador, visivel, RAIO } from './mapa.js';
import { encostaNaPorta } from '../construcao/geometriaPortas.js';
import { Alarmes, CAPACIDADE_ALARMES } from './alarmes.js';
import { circuitos } from './eletrica.js';
import { portaNaRota, rotaAtePorta, rotaBot } from './bot.js';
import { separarDepoisDoToque } from './reposicionar.js';

const interruptores = new Map(circuitos.map(({comando})=>[comando.id,comando]));
const TRAVA_PORTA = 5000;
const travada=(p,agora)=>!p.aberta && (p.progresso>0 || agora<p.destravaEm);
export const INATIVIDADE = 14_000;

export class Partida {
  jogadores = new Map();
  portas = new Map(portas.map(p => [p.id, { ...p, progresso: 0, aberta: false, destravaEm: 0 }]));
  progresso = {};
  luzesApagadas = new Set();
  alarmes = new Alarmes();
  bot = null;
  pegador = null;
  toqueEm = -Infinity;

  entrar(cor, agora) {
    if (!CORES.some(c => c.id===cor)) return null;
    if ([...this.jogadores.values()].some(p => p.cor===cor)) return null;
    const chave = randomUUID();
    const ocupados = [...this.jogadores.values()];
    const ponto = pontosInicio.find(([x,z]) => ocupados.every(p => Math.hypot(x-p.x,z-p.z)>.48) && livre(x,z,this.progresso));
    const [x,z] = ponto ?? pontosInicio[0];
    this.jogadores.set(chave,{ id:cor, cor, x,z, dx:0,dz:0,abaixado:false,reposicao:0,pontos:0,visto:agora,entrada:agora,
      comandoEm:-Infinity,entradaId:-1,estoqueAlarmes:CAPACIDADE_ALARMES,avisosAlarmes:[] });
    this.atualizarParticipantes(agora);
    return chave;
  }

  sair(chave,agora) {
    const jogador=this.jogadores.get(chave);
    if (!jogador) return;
    this.alarmes.retirar(jogador);
    this.jogadores.delete(chave);
    this.atualizarParticipantes(agora);
  }

  atualizarParticipantes(agora) {
    if (this.jogadores.size===0) {
      for (const p of this.portas.values()) {
        p.progresso=0; p.aberta=false; p.destravaEm=0; p.alarmePendente=null;
      }
      this.progresso={};
      this.luzesApagadas.clear();
      this.alarmes.itens.clear();
      this.bot=null;
      this.pegador=null;
      return;
    }
    const pessoa=this.jogadores.values().next().value;
    if (this.jogadores.size===1 && !this.bot) {
      this.bot={ id:'bot',cor:CORES.find(c=>c.id!==pessoa.cor).id,x:0,z:-7.8,pontos:0,abaixado:false,reposicao:0,rota:[],rotaEm:agora };
    }
    if (this.jogadores.size>1) this.bot=null;
    if (!this.atores().some(p=>p.id===this.pegador)) this.pegador=pessoa.id;
    this.toqueEm=agora;
  }

  atores() {
    const pessoas=[...this.jogadores.values()];
    if (this.bot) pessoas.push(this.bot);
    return pessoas;
  }

  controlar(chave,dados,agora) {
    const p=this.jogadores.get(chave);
    if (!p) return false;
    if (!Number.isFinite(dados.dx) || !Number.isFinite(dados.dz)
      || !Number.isSafeInteger(dados.seq) || dados.seq<=p.entradaId) return true;
    const modulo=Math.max(1,Math.hypot(dados.dx,dados.dz));
    p.dx=dados.dx/modulo;
    p.dz=dados.dz/modulo;
    p.abaixado=dados.abaixado===true;
    p.entradaId=dados.seq;
    p.visto=agora;
    if (dados.acao && agora-p.comandoEm>240) this.acionar(p,dados.acao,agora);
    return true;
  }

  acionar(p,acao,agora) {
    if (acao.tipo==='porta') {
      const porta=this.portas.get(acao.id);
      if (!porta || !portaAoAlcance(porta,p.x,p.z,this.progresso)) return;
      if (porta.aberta) {
        porta.aberta=false;
        porta.destravaEm=agora+TRAVA_PORTA;
        porta.alarmePendente=null;
      } else this.abrirPorta(porta,p,agora);
    } else if (acao.tipo==='luz') {
      const botao=interruptores.get(acao.id);
      if (!botao || !interage(p.x,p.z,botao,this.progresso,p.abaixado)) return;
      if (!this.luzesApagadas.delete(botao.alvo)) this.luzesApagadas.add(botao.alvo);
    } else if (acao.tipo==='alarme') {
      this.alarmes.deixar(p,comodo(p.x,p.z));
    } else return;
    p.comandoEm=agora;
  }

  abrirPorta(porta,jogador,agora) {
    if (porta.aberta || travada(porta,agora)) return false;
    porta.aberta=true;
    porta.destravaEm=0;
    const sala=comodoAoAbrir(porta,jogador.x,jogador.z);
    porta.alarmePendente=sala ? {jogador,sala} : null;
    return true;
  }

  mover(p,dx,dz,agora) {
    const anterior=comodo(p.x,p.z);
    Object.assign(p,avancar(p.x,p.z,dx,dz,this.progresso));
    const atual=comodo(p.x,p.z);
    if (atual!==anterior) this.alarmes.detectar(this.pegador,p,atual,'entrou',agora);
  }

  passo(agora,delta) {
    for (const [chave,p] of this.jogadores) if (agora-p.visto>INATIVIDADE) this.sair(chave,agora);
    this.alarmes.atualizar(agora);
    if (!this.jogadores.size) return;
    const atores=this.atores();
    for (const p of this.jogadores.values()) {
      if (agora-p.visto>360 || (!p.dx && !p.dz)) continue;
      const velocidade=velocidadeJogador(p.abaixado)*delta;
      this.mover(p,p.dx*velocidade,p.dz*velocidade,agora);
    }
    if (this.bot) this.passoBot(agora,delta);
    for (const porta of this.portas.values()) {
      const alvo=Number(porta.aberta);
      const diferenca=alvo-porta.progresso;
      if (!diferenca) continue;
      const prox=porta.progresso+Math.sign(diferenca)*Math.min(Math.abs(diferenca),delta*1.7);
      for (let i=0;i<3;i++) {
        const teste=porta.progresso+(prox-porta.progresso)/(3-i);
        if (atores.some(p=>encostaNaPorta(porta,p.x,p.z,teste,RAIO))) break;
        porta.progresso=teste;
      }
      if (porta.progresso>0 && porta.alarmePendente) {
        const {jogador,sala}=porta.alarmePendente;
        porta.alarmePendente=null;
        if (atores.includes(jogador)) this.alarmes.detectar(this.pegador,jogador,sala,'abriu',agora);
      }
      if (!porta.aberta && porta.progresso===0) porta.destravaEm=agora+TRAVA_PORTA;
      this.progresso[porta.id]=porta.progresso;
    }
    this.pontuar(agora,atores);
  }

  passoBot(agora,delta) {
    const b=this.bot;
    const pessoa=this.jogadores.values().next().value;
    const fugir=this.pegador!==b.id;
    if (b.esperandoPorta) {
      const porta=this.portas.get(b.esperandoPorta);
      if (porta.aberta && porta.progresso<1) return;
      b.esperandoPorta=null;
      b.rotaEm=agora;
    }
    b.abaixado=!fugir && pessoa.abaixado && Math.hypot(b.x-pessoa.x,b.z-pessoa.z)<1.5;
    if (agora>=b.rotaEm || b.fugindo!==fugir) {
      this.planejarBot(b,pessoa,fugir,agora);
      b.rotaEm=agora+(fugir?460:540);
      b.fugindo=fugir;
    }
    while (b.rota.length && Math.hypot(b.x-b.rota[0][0],b.z-b.rota[0][1])<.10) b.rota.shift();
    if (!b.rota.length) return;
    const [x,z]=b.rota[0];
    const dist=Math.hypot(x-b.x,z-b.z);
    const passo=Math.min(dist,delta*(fugir?1.92:b.abaixado?1.90:2.15));
    this.mover(b,(x-b.x)/dist*passo,(z-b.z)/dist*passo,agora);
  }

  planejarBot(bot,pessoa,fugir,agora) {
    const disponiveis=[...this.portas.values()].filter(p=>!p.aberta && !travada(p,agora));
    const previsto={...this.progresso};
    for (const p of disponiveis) previsto[p.id]=1;
    const rota=rotaBot(bot,pessoa,previsto,fugir);
    const porta=portaNaRota(bot,rota,disponiveis);
    if (!porta) {
      bot.rota=rota;
      return;
    }

    const acesso=rotaAtePorta(bot,porta,this.progresso);
    if (!acesso.encontrou) {
      bot.rota=rotaBot(bot,pessoa,this.progresso,fugir);
    } else if (acesso.rota.length) {
      bot.rota=acesso.rota;
    } else {
      this.abrirPorta(porta,bot,agora);
      bot.esperandoPorta=porta.id;
      bot.rota=[];
    }
  }

  pontuar(agora,atores) {
    const quemPega=atores.find(p=>p.id===this.pegador);
    if (!quemPega || agora-this.toqueEm<1250) return;
    const pego=atores.find(p=>p!==quemPega
      && Math.hypot(p.x-quemPega.x,p.z-quemPega.z,alturaJogador(p.abaixado)-alturaJogador(quemPega.abaixado))<.51
      && visivel(p.x,p.z,quemPega.x,quemPega.z,this.progresso));
    if (pego) {
      const destino=separarDepoisDoToque(quemPega,pego,atores,this.progresso);
      if (!destino) return;
      Object.assign(pego,destino,{dx:0,dz:0,reposicao:pego.reposicao+1});
      if (pego===this.bot) {pego.rota=[];pego.rotaEm=agora;pego.esperandoPorta=null;}
      quemPega.pontos++;
      this.pegador=pego.id;
      this.toqueEm=agora;
    }
  }

  estado(agora=Date.now()) {
    return {
      jogadores:this.atores().map(({id,cor,x,z,pontos,abaixado,reposicao})=>({id,cor,x,z,pontos,abaixado,reposicao})),
      pegador:this.pegador,
      portas:Object.fromEntries([...this.portas.values()].filter(p=>p.aberta || travada(p,agora))
        .map(p=>[p.id,[Math.round(p.progresso*1000)/1000,p.aberta,
          p.aberta ? 0 : Math.max(0,p.progresso>0?TRAVA_PORTA:p.destravaEm-agora)]])),
      luzesApagadas:[...this.luzesApagadas],
      alarmes:this.alarmes.estado(agora),
    };
  }

  dadosDoJogador(chave,aposAviso,agora) {
    const p=this.jogadores.get(chave);
    if (!p) return null;
    const apos=Number.isSafeInteger(aposAviso) ? aposAviso : 0;
    return {estoqueAlarmes:p.estoqueAlarmes,avisos:this.alarmes.avisos(p,apos,agora)};
  }
}
