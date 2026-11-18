async function enviar(url,dados) {
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(dados),
    signal:AbortSignal.timeout(4500)});
  if (res.status===410) return {expirou:true};
  const resposta=await res.json();
  if (!res.ok) throw new Error(resposta.erro ?? 'Servidor indisponível.');
  return resposta;
}

export function criarRede(estado,status,expirou,privado) {
  const eventos=new EventSource('/api/estado');
  let chave, acao, ocupado=false, seq=0, aposAviso=0;
  eventos.onopen=()=>status(true);
  eventos.onerror=()=>status(false);
  eventos.onmessage=e=>estado(JSON.parse(e.data));
  window.addEventListener('pagehide',()=>{
    if (chave) navigator.sendBeacon('/api/sair',new Blob([JSON.stringify({chave})],{type:'application/json'}));
  });

  return {
    async entrar(cor) {
      const resposta=await enviar('/api/entrar',{cor});
      chave=resposta.chave;
      seq=0;
      aposAviso=0;
      acao=undefined;
    },
    async sair() {
      const anterior=chave;
      chave=undefined;
      acao=undefined;
      if (anterior) await enviar('/api/sair',{chave:anterior});
    },
    acionar(comando) {acao=comando;},
    async sincronizar(movimento) {
      if (!chave || ocupado) return;
      const atual=chave;
      ocupado=true;
      const comando=acao;
      acao=undefined;
      try {
        const resposta=await enviar('/api/controle',{chave:atual,seq:seq++,...movimento,acao:comando,aposAviso});
        if (chave!==atual) return;
        if (resposta.expirou) {
          chave=undefined;
          expirou();
          return;
        }
        aposAviso=resposta.avisos.at(-1)?.id ?? aposAviso;
        privado(resposta);
      } catch {
        status(false);
      } finally {
        ocupado=false;
      }
    },
  };
}
