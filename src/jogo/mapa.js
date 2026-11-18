import { ambientes, bordaVaranda, contorno, patamar, ponto } from '../construcao/planta.js';
import { colisoresDasParedes, paredes, pilares, pontoParede } from '../construcao/estrutura.js';
import { criarColisao, dentro } from '../construcao/colisao.js';
import { listarPortas, podeAcionarPorta } from '../construcao/geometriaPortas.js';

export const ALTURA = 1.60;
export const ALTURA_ABAIXADO = .93;
export const alturaJogador = abaixado => abaixado ? ALTURA_ABAIXADO : ALTURA;
export const RAIO = .155;
export const ALCANCE = 2;
export const VELOCIDADE = 2.8;
export const velocidadeJogador = abaixado => abaixado ? VELOCIDADE * .64 : VELOCIDADE;
export const CORES = [
  { id: 'coral', nome: 'Coral', hex: '#ff7269' }, { id: 'azul', nome: 'Azul', hex: '#58b6ff' },
  { id: 'lima', nome: 'Lima', hex: '#a9e35a' }, { id: 'violeta', nome: 'Violeta', hex: '#b69aff' },
  { id: 'ambar', nome: 'Âmbar', hex: '#ffbf53' }, { id: 'rosa', nome: 'Rosa', hex: '#fa91c9' },
  { id: 'menta', nome: 'Menta', hex: '#4ddfc2' }, { id: 'branco', nome: 'Branco', hex: '#f1f5fc' },
];
const meio = 1.12;
const intervalo = 3.08;
const acessoServico = meio + ponto([120, 10])[0];
const acessoSocial = intervalo + ponto([25, 474])[1];
const inicioAlaServico = intervalo + ponto([25, 14])[1];
const fundoElevadoresSociais = 6.60;
const frenteElevadoresSociais = 8.98;
const bordaHall = 3.89;
export const unidades = [
  { id: '03', sx: -1, sz: -1, tinta: '#f3c7a7' },
  { id: '04', sx: 1, sz: -1, tinta: '#bfd7ed' },
  { id: '02', sx: -1, sz: 1, tinta: '#e4d2b4' },
  { id: '01', sx: 1, sz: 1, tinta: '#c2ddc5' },
].map(u => ({ ...u, x: u.sx * meio, z: u.sz * intervalo }));
export const transformar = (u, [x, z]) => [u.x + u.sx * x, u.z + u.sz * z];

const bordaCorredor = acessoServico + .05;
const contornoLateral = [
  [bordaHall, -10.70], [bordaHall, -frenteElevadoresSociais],
  [meio, -frenteElevadoresSociais], [meio, -fundoElevadoresSociais],
  [bordaCorredor, -fundoElevadoresSociais], [bordaCorredor, fundoElevadoresSociais],
  [meio, fundoElevadoresSociais], [meio, frenteElevadoresSociais],
  [bordaHall, frenteElevadoresSociais], [bordaHall, 10.70],
];
export const areaComum = [...contornoLateral, ...[...contornoLateral].reverse().map(([x,z]) => [-x,z])];
export const perimetros = [areaComum, ...unidades.map(u => contorno.map(p => transformar(u,p)))];

const muro = (axis, fixa, a, b, holes = []) => (
  { axis, x: axis === 'x' ? a : fixa, z: axis === 'z' ? a : fixa, len: b-a, holes }
);
const horizontal = (z,a,b,holes) => muro('x',z,a,b,holes);
const vertical = (x,a,b,holes) => muro('z',x,a,b,holes);
const faixa = (s,a,b) => s<0 ? [-b,-a] : [a,b];
const profundidadeElevadorServico = 2.79;
const faixasElevadoresServico = [[-2.72,-.16],[.16,2.72]];
const [[sv1Inicio, sv1Fim], [sv2Inicio, sv2Fim]] = faixasElevadoresServico;

export const portaCortaFogo = { x: -acessoServico, z: -2.26, w: .94, bottom: 0, top: 2.10 };
export const quadroMedicao = { x: -acessoServico, z: -.40, w: 1.74, bottom: .28, top: 1.81 };
export const lixeiraCorredor = { x: acessoServico - .25, z: -3.65, raio: .205 };

function vaoFixo({z,w,bottom,top}, id) {
  return { at: z - w / 2 + inicioAlaServico, w, bottom, top, id, kind: 'fixed' };
}

// O corredor acompanha as alas de serviço e afunila entre os elevadores
// sociais. Os dois vãos ficam nas extremidades, voltados para cada hall.
const paredesComuns = [
  vertical(-acessoServico, -inicioAlaServico, inicioAlaServico, [
    vaoFixo(portaCortaFogo, 'comum/corta-fogo'),
    vaoFixo(quadroMedicao, 'comum/medicao'),
  ]),
  vertical(acessoServico, -inicioAlaServico, sv1Inicio),
  vertical(acessoServico, sv1Fim, sv2Inicio),
  vertical(acessoServico, sv2Fim, inicioAlaServico),
];
for (const [s, par] of [[-1, '03-04'], [1, '02-01']]) {
  paredesComuns.push(
    horizontal(s*acessoSocial, -meio-.10, meio+.10),
    horizontal(s*fundoElevadoresSociais, -acessoServico, -meio),
    horizontal(s*fundoElevadoresSociais, meio, acessoServico),
    vertical(-meio, ...faixa(s, fundoElevadoresSociais, frenteElevadoresSociais)),
    vertical(meio, ...faixa(s, fundoElevadoresSociais, frenteElevadoresSociais)),
    vertical(-bordaHall, ...faixa(s, frenteElevadoresSociais, acessoSocial)),
    vertical(bordaHall, ...faixa(s, frenteElevadoresSociais, acessoSocial)),
    horizontal(s*frenteElevadoresSociais, -meio, meio, [{
      at: meio - .40, w: .80, id: `comum/hall-${par}`,
      name: `Porta do hall ${par.replace('-', ' / ')}`,
      kind: 'door', bottom: 0, top: 2.10, hinge: 'end', swing: -s,
      acabamento: { folha: '#aaa9a3', marco: '#ceccc3' },
    }]),
  );
}

function transformarParede(u, linha) {
  const sentido = linha.axis === 'x' ? u.sx : u.sz;
  const inicio = pontoParede(linha, sentido < 0 ? linha.len : 0);
  const [x, z] = transformar(u,[inicio.x,inicio.z]);
  const meioDaParede = pontoParede(linha, linha.len / 2);
  const facesInternas = [1, -1].map(lado => dentro(contorno,
    meioDaParede.x + (linha.axis === 'z' ? lado * u.sx * .17 : 0),
    meioDaParede.z + (linha.axis === 'x' ? lado * u.sz * .17 : 0)));
  const holes = linha.holes.map(h => ({
    ...h, id: h.id && `${u.id}/${h.id}`,
    at: sentido < 0 ? linha.len - h.at - h.w : h.at,
    hinge: sentido < 0 && h.hinge ? (h.hinge === 'start' ? 'end' : 'start') : h.hinge,
    swing: h.swing && h.swing * u.sx * u.sz,
    acabamento: ['entrada', 'entrada-servico'].includes(h.id)
      ? { folha: '#deddd4', marco: '#efeee6' } : h.acabamento,
  })).sort((a,b) => a.at-b.at);
  return { ...linha, x, z, holes, tinta: u.tinta, facesInternas };
}

export const linhas = [...paredesComuns, ...unidades.flatMap(u => paredes.map(w => transformarParede(u,w)))];
export const gradis = unidades.flatMap(u => [
  bordaVaranda.map(p => transformar(u,p)),
  patamar.slice(0,3).map(p => transformar(u,p)),
]);
export const colunas = [
  ...[-1,1].flatMap(s => {
    const [a,b] = faixa(s, 3.18, 3.50);
    return [[-acessoServico-.07,a,-acessoServico+.29,b], [acessoServico-.29,a,acessoServico+.07,b]];
  }),
  ...unidades.flatMap(u => pilares.map(([x1,z1,x2,z2]) => {
    const [a,b] = transformar(u,ponto([x1,z1]));
    const [c,d] = transformar(u,ponto([x2,z2]));
    return [Math.min(a,c),Math.min(b,d),Math.max(a,c),Math.max(b,d)];
  })),
];
const ladoElevadorSocial = meio + .05;
export const elevadores = [
  { id:'S1', box:[-bordaHall,-frenteElevadoresSociais,-ladoElevadorSocial,-fundoElevadoresSociais], face:'norte' },
  { id:'S2', box:[ladoElevadorSocial,-frenteElevadoresSociais,bordaHall,-fundoElevadoresSociais], face:'norte' },
  { id:'S3', box:[-bordaHall,fundoElevadoresSociais,-ladoElevadorSocial,frenteElevadoresSociais], face:'sul' },
  { id:'S4', box:[ladoElevadorSocial,fundoElevadoresSociais,bordaHall,frenteElevadoresSociais], face:'sul' },
  ...faixasElevadoresServico.map(([a,b],i)=>({
    id: `SV${i+1}`, box:[acessoServico,a,acessoServico+profundidadeElevadorServico,b], face:'oeste',
  })),
];
export const portas = listarPortas(linhas);

const caixa = ([minX,minZ,maxX,maxZ]) => ({ minX,minZ,maxX,maxZ });
const { x: xLixeira, z: zLixeira, raio: raioLixeira } = lixeiraCorredor;
const solidos = [
  ...colisoresDasParedes(linhas), ...colunas.map(caixa), ...elevadores.map(e => caixa(e.box)),
  caixa([xLixeira-raioLixeira,zLixeira-raioLixeira,xLixeira+raioLixeira,zLixeira+raioLixeira]),
];

export const {livre,avancar,trajetoLivre,visivel} = criarColisao({perimetros,solidos,portas,raio:RAIO});
export const noCorredor = (x,z) => dentro(areaComum,x,z);
export const portaAoAlcance = (porta,x,z,progresso) => podeAcionarPorta(porta,x,z,progresso,visivel);

export const salas = unidades.flatMap(u => ambientes.map(room => ({
  ...room, id: `${u.id}/${room.id}`, unidade: u, centro: transformar(u,room.centro),
  perimetro: room.perimetro.map(p => transformar(u,p)),
})));

export function comodo(x,z) {
  return salas.find(s => dentro(s.perimetro,x,z));
}

const comodosDasPortas = new Map(portas.map(porta => {
  const vertical = porta.wall.axis==='z';
  const lados = [-1,1].map(lado => {
    for (const distancia of [.17,.25,.36]) {
      const sala=comodo(porta.x+(vertical?distancia*lado:0),porta.z+(vertical?0:distancia*lado));
      if (sala) return sala;
    }
  });
  return [porta.id,lados];
}));

export function comodoAoAbrir(porta,x,z) {
  const deslocamento = porta.wall.axis==='z' ? x-porta.x : z-porta.z;
  return comodosDasPortas.get(porta.id)?.[Number(deslocamento<0)];
}

export function interage(x,z,botao,progresso,abaixado=false) {
  const dx=x-botao.x, dz=z-botao.z;
  return Math.hypot(dx,dz,alturaJogador(abaixado)-botao.y) <= ALCANCE && dx*botao.nx+dz*botao.nz>.032
    && visivel(x,z,botao.x,botao.z,progresso);
}

export const pontosInicio = [
  [0,-4.3], [0,-2.35], [-.55,-5.4], [.56,-3.25],
  [-.55,-2.85], [.55,-5.45], [-.55,-4.6], [.55,-1.3],
];
