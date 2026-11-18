# Pega-pega no Orquídea

Jogo em primeira pessoa no pavimento do Edifício Orquídea, com quatro apartamentos vazios, dois halls sociais, quatro elevadores sociais e dois de serviço na mesma lateral. Um corredor central liga os halls, com uma porta de 80 cm entre os elevadores sociais de cada hall. O mapa mantém as varandas e a distribuição da [planta corrigida](./artifacts/previa-andar-orquidea.png).

O corredor reproduz o piso cerâmico, os quadros metálicos e a sinalização das fotos. A porta corta-fogo indica o acesso à escada e permanece fechada durante a partida.

## Abrir a partida no computador

Com Node.js 22 ou mais recente, execute na pasta do projeto:

```sh
node server.mjs
```

O terminal mostra **Celulares no mesmo Wi-Fi** seguido do endereço que deve ser aberto nos celulares, por exemplo `http://192.168.1.20:8000`. No próprio computador, use [localhost:8000](http://localhost:8000). Deixe o servidor rodando enquanto jogam e encerre com Ctrl+C. O navegador precisa oferecer WebGL 2.

Se a porta estiver ocupada, execute `PORT=8001 node server.mjs` e use o endereço com a nova porta. Para um teste restrito ao próprio computador use `HOST=127.0.0.1 node server.mjs`. O servidor usa HTTP na rede local e não precisa baixar pacotes.

## Jogar

- Use o celular na horizontal. O joystick esquerdo move a esfera e arrastar na cena gira a câmera. Toque em **Abaixar** para desviar de quem está em pé e em **Levantar** para voltar. No computador, use WASD ou setas para andar, o mouse para olhar e **C** para abaixar ou levantar.
- Escolha uma cor disponível. A mesma cor pertence a apenas uma pessoa por vez. A esfera e a câmera ficam a 1,60 m em pé e a 0,93 m ao abaixar. A movimentação fica mais lenta nessa posição, e duas esferas abaixadas ainda podem se tocar.
- A até **1 metro da folha**, toque em qualquer parte da porta para abrir ou fechar. Você também pode mirar na folha e apertar **E**. As portas começam fechadas e ficam travadas por cinco segundos depois de fechar, inclusive para o bot. A folha para se encontrar alguém. Toque no **interruptor âmbar** para controlar a luz.
- Cada jogador tem **três alarmes** na cor da sua esfera. Dentro de um cômodo, use **Deixar alarme** para soltar uma bola no chão. Quando você estiver pegando, seus alarmes detectam quem abrir a porta para o cômodo ou entrar nele. O aviso mostra o apartamento e o cômodo. A bola pisca durante três segundos para indicar que alguém foi detectado e o alarme volta ao estoque assim que dispara.
- Quem está pegando marca **um ponto** ao tocar em outra esfera. Quem foi pego passa a pegar e reaparece a dois metros de quem marcou o ponto, em um lugar livre. O jogo prefere uma posição acessível e pode usar o ambiente vizinho em espaços pequenos. Se não houver lugar livre a dois metros, usa a menor distância disponível acima disso.
- Com uma pessoa, um bot participa do pega-pega e pode abrir portas pelo caminho. Com duas ou mais, a partida é entre os jogadores conectados. O servidor mantém o placar em memória apenas enquanto a sessão estiver ativa. A cor é liberada ao sair ou quando a conexão expira.

## Referências do mapa

O modelo usa a prancha arquitetônica de referência, guardada localmente em `arquivos/`, e a distribuição das áreas comuns da planta corrigida. Os PDFs elétricos das suítes das gêmeas, de visitas e master orientam os pontos de luz. A suíte master inclui plafon, spots e perfis LED conforme a revisão R02. As posições dos interruptores fora dos ambientes detalhados são aproximadas. A conferência direta do DWG elétrico depende de uma exportação legível em PDF ou DXF.

## Reusar portas e colisão em outra planta

Defina as paredes em metros com `x`, `z`, `axis` (`x` ou `z`), `len` e `holes`. Para cada abertura móvel use um `id` único, `kind` (`door` ou `slide`), `at` (distância desde o começo da parede), `w`, `bottom` e `top`. Uma porta de giro também recebe `hinge` (`start` ou `end`) e `swing` (`1` ou `-1`).

- [geometriaPortas.js](./src/construcao/geometriaPortas.js) extrai as portas com `listarPortas(linhas)` e valida o alcance com `podeAcionarPorta`.
- [colisao.js](./src/construcao/colisao.js) recebe os polígonos caminháveis, as caixas sólidas e as portas em `criarColisao({perimetros, solidos, portas, raio})`. Envie o progresso de abertura de cada porta (de 0 a 1) para as consultas de movimento e visibilidade. Para gerar caixas de parede a partir de `linhas`, use `colisoresDasParedes` de [estrutura.js](./src/construcao/estrutura.js).
- [portas.js](./src/construcao/portas.js) cria as folhas em Three.js com `criarPortas(cena, linhas)` e identifica a folha clicada com `selecionarPorta(raio, items, jogador, progresso, visivel)`.
