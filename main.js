import { criarCena, vistaInicial } from './src/jogo/cena.js';
import { criarControles } from './src/jogo/controles.js';
import { ALTURA, alturaJogador, avancar, CORES, comodo, velocidadeJogador } from './src/jogo/mapa.js';
import { criarRede } from './src/jogo/rede.js';
import { CAPACIDADE_ALARMES } from './src/jogo/alarmes.js';

const $=id=>document.getElementById(id);
const entrada=$('entrada'), hud=$('hud'), entrar=$('entrar'), status=$('status');
const usar=$('usar'), papel=$('papel'), placar=$('placar'), recado=$('recado');
const deixarAlarme=$('deixar-alarme'), alertaAlarme=$('alerta-alarme');
const bolasDoEstoque=[...deixarAlarme.querySelectorAll('.estoque i')];
const cores=new Map(CORES.map(c=>[c.id,c]));
let cena;
try { cena=criarCena($('viewport')); }
catch (erro) {
  console.error(erro);
  status.textContent='O jogo precisa de um navegador com WebGL 2.';
}

if (cena) iniciar();

function iniciar() {
  const botoes=new Map();
  let conectou=false, selecionada, eu, iniciando=false;
  let estado={jogadores:[],portas:{},luzesApagadas:[]};
  let progresso={}, local, ultimaReposicao, altura=ALTURA, placarAnterior='', aviso=0;
  let estoqueAlarmes=CAPACIDADE_ALARMES, temporizadorAlarme=0;

  const rede=criarRede(atualizar,conexao,()=>voltar('A conexão foi encerrada. Entre novamente.'),atualizarAlarmes);
  const controle=criarControles(cena.canvas,$('joystick'),$('manopla'),$('abaixar'),tocar);

  for (const cor of CORES) {
    const b=document.createElement('button');
    b.type='button';
    b.className='cor';
    b.style.setProperty('--cor',cor.hex);
    b.setAttribute('aria-pressed','false');
    b.innerHTML=`<i aria-hidden="true"></i><span>${cor.nome}</span>`;
    b.addEventListener('click',()=>{selecionada=cor.id;atualizarCores();});
    $('cores').append(b);
    botoes.set(cor.id,b);
  }
  function atualizarCores() {
    const ocupadas=new Set(estado.jogadores.filter(p=>p.id!=='bot').map(p=>p.cor));
    if (!eu && (!selecionada || ocupadas.has(selecionada))) selecionada=CORES.find(c=>!ocupadas.has(c.id))?.id;
    for (const [id,b] of botoes) {
      b.disabled=ocupadas.has(id);
      b.setAttribute('aria-pressed',String(id===selecionada));
      b.setAttribute('aria-label',cores.get(id).nome+(b.disabled?' · ocupada':''));
    }
    entrar.disabled=!conectou || !selecionada || iniciando;
  }

  function conexao(ok) {
    conectou=ok;
    if (eu) {
      if (!ok) avisar('Reconectando…',2500);
    } else status.textContent=ok?'Coral, azul, lima… escolha a sua.':'Conectando ao servidor…';
    atualizarCores();
  }

  function atualizar(dados) {
    estado=dados;
    progresso=Object.fromEntries(Object.entries(dados.portas).map(([id,val])=>[id,val[0]]));
    if (!conectou) conexao(true);
    atualizarCores();
    cena.atualizar(dados,eu);
    const humanos=dados.jogadores.filter(p=>p.id!=='bot').length;
    $('modo').textContent=humanos ? `${humanos} ${humanos===1?'jogadora conectada':'jogadoras conectadas'}` : 'Sozinha, você joga com um bot.';
    if (!eu) return;
    const meusDados=dados.jogadores.find(p=>p.id===eu);
    if (!meusDados) return;
    atualizarEstoque(meusDados);
    if (!meusDados) return;
    if (!local || ultimaReposicao!==meusDados.reposicao) {
      if (local) avisar('Agora você está pegando!',1500);
      local={x:meusDados.x,z:meusDados.z};
      ultimaReposicao=meusDados.reposicao;
    }
    const pegando=dados.pegador===eu;
    papel.classList.toggle('pegador',pegando);
    papel.style.setProperty('--cor',cores.get(eu).hex);
    papel.querySelector('span').textContent=pegando?'Você está pegando':'Fuja!';
    const chavePlacar=dados.jogadores.map(p=>[p.id,p.cor,p.pontos]).join(';')+dados.pegador;
    if (chavePlacar===placarAnterior) return;
    placarAnterior=chavePlacar;
    placar.replaceChildren(...dados.jogadores.map(p=>{
      const li=document.createElement('li');
      const cor=cores.get(p.cor);
      const nome=p.id===eu?'Você':p.id==='bot'?'Bot':cor.nome;
      li.style.setProperty('--cor',cor.hex);
      li.classList.toggle('pegador',p.id===dados.pegador);
      li.setAttribute('aria-label',`${nome}, ${p.pontos} ${p.pontos===1?'ponto':'pontos'}`);
      li.innerHTML=`<i aria-hidden="true"></i><span class="nome">${nome}</span><strong>${p.pontos}</strong>`;
      return li;
    }));
  }

  function avisar(texto,duracao) {
    recado.textContent=texto;
    recado.hidden=false;
    clearTimeout(aviso);
    aviso=setTimeout(()=>{recado.hidden=true;},duracao);
  }

  function atualizarEstoque(jogador) {
    const sala=jogador && comodo(jogador.x,jogador.z);
    deixarAlarme.disabled=!sala || estoqueAlarmes===0;
    for (const [i,bola] of bolasDoEstoque.entries()) bola.classList.toggle('disponivel',i<estoqueAlarmes);
    const acao=estoqueAlarmes===0 ? 'Todos os alarmes estão em uso'
      : sala ? 'Deixar alarme' : 'Entre em um cômodo para deixar um alarme';
    deixarAlarme.title=acao;
    deixarAlarme.setAttribute('aria-label',`${acao}. ${estoqueAlarmes} de ${CAPACIDADE_ALARMES} disponíveis.`);
  }

  function atualizarAlarmes({estoqueAlarmes:disponiveis,avisos}) {
    estoqueAlarmes=disponiveis;
    atualizarEstoque(estado.jogadores.find(p=>p.id===eu));
    if (!avisos.length) return;
    alertaAlarme.textContent=avisos.map(aviso=>{
      const local=`Apto. ${aviso.apartamento} · ${aviso.comodo}`;
      if (aviso.acao==='revelado') return `Sua localização foi revelada. ${local}`;
      const nome=aviso.jogador==='bot' ? 'Bot' : (cores.get(aviso.jogador)?.nome ?? 'Jogador');
      const acao=aviso.acao==='abriu' ? 'abriu a porta' : 'entrou no cômodo';
      return `${nome} ${acao}. ${local}`;
    }).join('\n');
    alertaAlarme.hidden=false;
    clearTimeout(temporizadorAlarme);
    temporizadorAlarme=setTimeout(()=>{alertaAlarme.hidden=true;},4600);
  }

  function voltar(texto) {
    eu=undefined;
    local=undefined;
    altura=ALTURA;
    placarAnterior='';
    clearTimeout(temporizadorAlarme);
    alertaAlarme.hidden=true;
    controle.ativar(false);
    hud.hidden=true;
    entrada.hidden=false;
    status.textContent=texto;
    cena.posicionar(...vistaInicial);
    atualizarCores();
  }

  entrar.addEventListener('click',async()=>{
    if (!selecionada || iniciando) return;
    const cor=selecionada;
    iniciando=true;
    atualizarCores();
    try {
      await rede.entrar(cor);
      eu=cor;
      estoqueAlarmes=CAPACIDADE_ALARMES;
      deixarAlarme.style.setProperty('--cor',cores.get(cor).hex);
      alertaAlarme.style.setProperty('--cor',cores.get(cor).hex);
      atualizarEstoque();
      recado.hidden=true;
      entrada.hidden=true;
      hud.hidden=false;
      controle.ativar(true);
      atualizar(estado);
    } catch (erro) {
      status.textContent=erro.message;
    } finally {
      iniciando=false;
      atualizarCores();
    }
  });
  $('sair').addEventListener('click',()=>{
    rede.sair().catch(()=>{});
    voltar('Escolha sua cor para jogar novamente.');
  });

  function tocar(e) {
    if (!eu) return;
    const botao=e?cena.tocar(e.clientX,e.clientY):cena.mirar();
    if (!botao) return;
    const espera=esperaDaPorta(botao);
    if (espera) {avisar(espera,1100);return;}
    rede.acionar({tipo:botao.tipo,id:botao.id});
  }
  usar.addEventListener('click',()=>tocar());
  deixarAlarme.addEventListener('click',()=>{
    if (eu && !deixarAlarme.disabled) rede.acionar({tipo:'alarme'});
  });

  function esperaDaPorta(botao) {
    const [progresso,aberta,restante]=estado.portas[botao.id] ?? [];
    if (botao.tipo!=='porta' || aberta || !restante) return '';
    return progresso>0?'Fechando porta':`Porta travada · ${Math.ceil(restante/1000)} s`;
  }

  function atualizarMira() {
    const mira=cena.mirar();
    $('mira').classList.toggle('ativo',Boolean(mira));
    usar.hidden=!mira;
    if (!mira) return;
    const espera=esperaDaPorta(mira);
    usar.disabled=Boolean(espera);
    const texto=espera || (mira.tipo==='porta'
      ? (estado.portas[mira.id]?.[1]?'Fechar porta':'Abrir porta')
      : (estado.luzesApagadas.includes(mira.alvo)?'Acender luz':'Apagar luz'));
    if (usar.textContent!==texto) usar.textContent=texto;
    usar.setAttribute('aria-label',`${texto} · ${mira.nome}`);
  }

  let anterior=performance.now(), ultimaMira=0;
  function quadro(agora) {
    const dt=Math.min(.065,(agora-anterior)/1000);
    anterior=agora;
    const p=eu && estado.jogadores.find(j=>j.id===eu);
    if (local && p) {
      const {dx,dz,abaixado}=controle.movimento();
      const velocidade=velocidadeJogador(abaixado);
      const {yaw,pitch}=controle.olhar();
      if (Math.hypot(local.x-p.x,local.z-p.z)>.72) local={x:p.x,z:p.z};
      local=avancar(local.x,local.z,dx*velocidade*dt,dz*velocidade*dt,progresso);
      const ajuste=1-Math.exp(-11*dt);
      local=avancar(local.x,local.z,(p.x-local.x)*ajuste,(p.z-local.z)*ajuste,progresso);
      altura+=(alturaJogador(abaixado)-altura)*(1-Math.exp(-17*dt));
      cena.posicionar(local.x,local.z,yaw,pitch,altura);
      if (agora-ultimaMira>85) {atualizarMira();ultimaMira=agora;}
    }
    cena.renderizar(dt);
    requestAnimationFrame(quadro);
  }
  setInterval(()=>{if(eu) rede.sincronizar(controle.movimento());},65);
  requestAnimationFrame(quadro);
}
