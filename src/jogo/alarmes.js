export const CAPACIDADE_ALARMES = 3;
const DURACAO_SINAL = 3000;
const DURACAO_AVISO = 20_000;

export class Alarmes {
  itens = new Map();
  proximoAlarme = 0;
  proximoAviso = 0;

  deixar(jogador,sala) {
    if (!sala || jogador.estoqueAlarmes<=0) return;
    jogador.estoqueAlarmes--;
    const id=++this.proximoAlarme;
    this.itens.set(id,{id,dono:jogador,x:jogador.x,z:jogador.z,sala:sala.id,expira:null});
  }

  detectar(pegador,visitante,sala,acao,agora) {
    if (!sala || visitante.id===pegador) return;
    const disparados=[...this.itens.values()].filter(a=>a.expira===null && a.dono.id===pegador && a.sala===sala.id);
    if (!disparados.length) return;
    const {dono}=disparados[0];
    for (const alarme of disparados) alarme.expira=agora+DURACAO_SINAL;
    dono.estoqueAlarmes+=disparados.length;
    const local={apartamento:sala.unidade.id,comodo:sala.nome};
    this.avisar(dono,{...local,acao,jogador:visitante.id},agora);
    this.avisar(visitante,{...local,acao:'revelado'},agora);
  }

  avisar(jogador,detalhes,agora) {
    if (!jogador.avisosAlarmes) return;
    jogador.avisosAlarmes.push({id:++this.proximoAviso,criado:agora,...detalhes});
  }

  avisos(jogador,apos,agora) {
    jogador.avisosAlarmes=jogador.avisosAlarmes.filter(a=>agora-a.criado<DURACAO_AVISO && a.id>apos);
    return jogador.avisosAlarmes.map(({criado,...aviso})=>aviso);
  }

  retirar(jogador) {
    for (const [id,a] of this.itens) if (a.dono===jogador && a.expira===null) this.itens.delete(id);
  }

  atualizar(agora) {
    for (const [id,a] of this.itens) if (a.expira!==null && a.expira<=agora) this.itens.delete(id);
  }

  estado(agora) {
    return [...this.itens.values()].filter(a=>a.expira===null || a.expira>agora)
      .map(({id,dono,x,z,expira})=>({id,cor:dono.cor,x,z,restante:expira===null?0:expira-agora}));
  }
}
