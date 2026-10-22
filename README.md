# Legenda Maior

Extensão do Chrome para aumentar as legendas da Netflix e de outros streamings.

## Instalar

1. Abra `chrome://extensions`
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação** e selecione esta pasta
4. Fixe a extensão na barra (ícone de quebra-cabeça → alfinete)

## Usar

Clique no ícone da extensão para abrir a janelinha:

- **Tamanho**: slider de 50% a 400%, botões −/+ e atalhos (100/150/200/250%)
- **Subir legenda**: desloca a legenda para cima, útil quando ela fica grande demais
- **Estilos prontos**: Original, Amarela com borda preta, Branca com borda preta
- **Cor da letra**: marque "Personalizar" e escolha uma cor (ou qualquer outra no seletor)
- **Borda da letra**: espessura de 0 a 5px e cor do contorno
- **Remover fundo**: tira a caixa escura que alguns sites colocam atrás do texto
- **Liga/desliga** e **Restaurar padrão**

As mudanças aplicam na hora, sem recarregar a página, e ficam salvas.

## Compatibilidade

Seletores específicos para Netflix, YouTube, Prime Video, Disney+, Max e Paramount+,
além de players genéricos (video.js, Shaka, JW Player, Bitmovin, Plyr) e legendas
nativas `<video>` (WebVTT) — o que cobre Globoplay e muitos outros sites.

Se um streaming não funcionar, inspecione a legenda (botão direito → Inspecionar),
pegue a classe do elemento que envolve o texto e adicione em `CONTAINERS` no `content.js`.

Limitação: serviços que desenham a legenda em `<canvas>` (ex.: alguns players do
Crunchyroll) não podem ser ajustados por CSS.
