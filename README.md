# Casa — planta residencial em Three.js

Modelo interativo feito a partir da imagem fornecida, com módulos independentes para construção, móveis e navegação. A biblioteca Three.js **0.180.0**, o OrbitControls e a licença MIT estão em `vendor/three/`. Não é necessário instalar pacotes ou acessar uma CDN.

## Executar

Na pasta do projeto:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra http://localhost:8000 em um navegador com WebGL 2. Os módulos JavaScript precisam de um servidor HTTP; abrir `index.html` diretamente por `file://` não funciona. Encerre o servidor com Ctrl+C.

## Exploração

- **3D:** arraste para girar, use a roda para aproximar e o botão direito para deslocar.
- **Planta:** vista ortográfica superior, com ampliação pela roda ou pelos botões +/−.
- **Passear:** use WASD, setas ou os botões na tela para andar; arraste para olhar e pressione Esc para voltar. A câmera respeita paredes, janelas e o perímetro; as folhas das portas também têm colisão, inclusive durante a animação. Não há colisão com móveis.
- **Portas:** começam fechadas. No passeio, aproxime-se e pressione **E** ou toque no botão que identifica a porta mais próxima. Também é possível abrir/fechar cada porta pelo painel **Controlar portas**, em qualquer vista. Se você estiver na trajetória da folha, a animação aguarda você se afastar.
- Selecione um ambiente na lateral para focar nele ou ir até ele durante o passeio.
- Alterne mobiliário, identificação com medidas e paredes completas. A vista padrão usa paredes rebaixadas para mostrar os interiores.
- O botão de imagem salva a renderização 3D em PNG (sem os rótulos da interface).
- **Ver referência** abre a imagem original.

## Estrutura

```text
index.html
main.js
style.css
assets/planta-referencia.png
src/
  utils.js
  construcao/{planta,estrutura,janelas,portas,teto,iluminacao}.js
  sala/{sofa,rack}.js
  cozinha/{bancada,pia,fogao,geladeira,mesa}.js
  quartos/{cama,guardaRoupa,criadoMudo}.js
  banheiros/{vaso,pia,chuveiro}.js
  controles/movimento.js
vendor/three/
```

`src/construcao/planta.js` centraliza os ambientes, dimensões e contorno. `estrutura.js` define as paredes e vãos reais de portas e janelas. `main.js` monta a cena e posiciona os móveis. Cada módulo de móvel exporta uma função de criação, usando metros e o eixo Y como altura. X cresce para a direita da planta e Z para baixo.

## Referência e aproximações

| Ambiente | Dimensões internas |
| --- | --- |
| Sala | 2,85 × 3,85 m |
| Cozinha | 2,85 × 2,40 m |
| Quarto 01 | 3,00 × 3,55 m |
| Quarto 02 | 3,00 × 2,70 m |
| Quarto 03 | 3,20 × 2,70 m |
| Banheiro 01 | 1,30 × 2,40 m |
| Banheiro 02 | 1,30 × 2,40 m |

O posicionamento dos ambientes e a disposição geral dos móveis seguem a imagem. Foram estimados: espessura de paredes (14 cm), pé-direito (2,70 m), circulação, dimensões de móveis e posições/tamanhos de aberturas. Trata-se de uma visualização de estudo, não de um projeto executivo. Não se infere área total construída a partir das cotas parciais.

Documentação de referência: [instalação do Three.js](https://threejs.org/manual/pages/installation.html) e [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html).

## Sentido de abertura das portas

Sentidos definidos na vista superior, com a referência orientada como na imagem:

- Banheiros: dobradiças na extremidade esquerda do vão; abertura para cima, para dentro, junto à parede esquerda de cada banheiro.
- Quarto 01 (superior direito): dobradiças na extremidade inferior do vão; abertura para a direita, junto à parede inferior do quarto.
- Quarto 02 (inferior esquerdo): dobradiças na extremidade direita; abertura para baixo, junto à parede direita do quarto.
- Quarto 03 (inferior direito): dobradiças na extremidade esquerda; abertura para baixo, junto à parede esquerda do quarto.
- Entradas da sala e cozinha: dobradiças à esquerda; abertura para baixo, para dentro da casa.

Os arcos desenhados no piso mostram o giro correto. As folhas internas não varrem o corredor. Os lados de dobradiça e o sentido estão explícitos em `estrutura.js` (`hinge`, `swing`). A escolha segue os arcos da referência e reserva a abertura junto às paredes, sem varrer os móveis existentes. É uma solução de layout para este modelo, não uma declaração de conformidade normativa. [Referência sobre circulação e área de giro](https://www.archdaily.com/1187415/5-things-to-consider-when-planning-interior-thresholds).

## Teto, luminárias e interruptores

O modo **Passear** mostra o teto completo a 2,70 m e oito circuitos de iluminação artificial: um por ambiente e outro para o corredor. As luzes começam acesas. O teto e as luminárias ficam ocultos na planta e na vista 3D para preservar a leitura dos interiores; o estado dos interruptores é mantido ao trocar de vista.

- Clique ou toque no interruptor físico na parede, a até 2 m de distância.
- Perto de um interruptor, pressione **F** ou use o botão que identifica o ambiente.
- O painel **Iluminação** também permite controlar cada circuito individualmente.
- Os interruptores ficam perto das entradas, a 1,15 m do piso. Os dos banheiros estão no corredor. Paredes, portas e móveis visíveis bloqueiam a interação à distância.
- As luminárias têm luz quente, difusores que acendem e sombras. Desligar uma luz mantém a iluminação natural e ambiente residual. Os mapas de sombra são atualizados quando necessário, inclusive durante o giro das portas.

O contorno do teto está em `teto.js`; luminárias, potência visual, posição dos interruptores e interação estão em `iluminacao.js`. A iluminação é ilustrativa, não um cálculo luminotécnico. APIs utilizadas: [SpotLight](https://threejs.org/docs/pages/SpotLight.html) e [Raycaster](https://threejs.org/docs/pages/Raycaster).
