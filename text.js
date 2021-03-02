"use strict";

export class Text {
  constructor() {
    // 임시 캔버스를 만들어 줌.
    this.canvas = document.createElement("canvas");
    // this.canvas.style.position = "absolute";
    // this.canvas.style.top = "0";
    // this.canvas.style.left = "0";
    // document.body.appendChild(this.canvas);
    // 텍스트가 어느 위치에 어떻게 렌더되는지 보여주려고 임시로 DOM에 추가해서 보여줌.
    // 나중에 실제 캔버스에 렌더할때는 그냥 지워줄 예정.

    this.ctx = this.canvas.getContext("2d");
  }

  // 리사이징될 때마다 변경된 사이즈를 가져와서 임시 캔버스에 텍스트를 새롭게 렌더해주고
  // 색상값이 존재하는 픽셀들의 좌표값 배열을 return 해주는 메소드
  setText(str, density, stageWidth, stageHeight) {
    this.canvas.width = stageWidth;
    this.canvas.height = stageHeight;

    const myText = str;
    const fontWidth = 700; // Web Font Loader에서 가져온 폰트의 굵기
    const fontSize = 800; // 캔버스에 렌더할 폰트의 사이즈 (폰트의 실제 높이값과는 전혀 다름!)
    const fontName = "Hind"; // Web Font Loader에서 가져온 폰트

    // 리사이징 이벤트 이전에 임시 캔버스에 렌더됬었던 텍스트는 싹 한 번 지워주고 다시 새로운 위치에 렌더하려는 것.
    this.ctx.clearRect(0, 0, stageWidth, stageHeight);
    this.ctx.font = `${fontWidth} ${fontSize}px ${fontName}`; // 렌더할 텍스트 스타일 지정. CSS font 프로퍼티와 동일 구문. MDN 참고.
    this.ctx.fillStyle = `rgba(0, 0, 0, 0.3)`; // 투명도가 0.3인 black으로 텍스트를 렌더해 줌.
    this.ctx.textBaseline = `middle`; // textBaseline은 고정된 상태에서 종류에 따라 텍스트 높낮이만 왔다갔다 함.

    // 위에서 지정한 대로 해당 텍스트를 렌더될 때의 width, 픽셀 등의 정보가 담긴 TextMetrics 객체 리턴.
    // 텍스트를 그릴 때 TextMetrics안의 값들을 이용해서 텍스트의 위치를 잡아줘야 하기 때문에 가져온 것.
    const fontPos = this.ctx.measureText(myText);
    this.ctx.fillText(
      myText,
      (stageWidth - fontPos.width) / 2, // 렌더할 텍스트의 x좌표값
      fontPos.actualBoundingBoxAscent +
        fontPos.actualBoundingBoxDescent +
        (stageHeight - fontSize) / 2 // 렌더할 텍스트의 y좌표값
    );

    // 현재 텍스트가 렌더된 임시 캔버스에서 색상값을 가지는 픽셀들의 좌표값 배열을 리턴받는 메소드를 호출함.
    return this.dotPos(density, stageWidth, stageHeight);
  }

  dotPos(density, stageWidth, stageHeight) {
    // 임시 캔버스에 존재하는 모든 픽셀들의 색상데이터 배열을 가져와서 복사함
    const imageData = this.ctx.getImageData(0, 0, stageWidth, stageHeight).data;

    const particles = []; // 색상값이 존재하는 픽셀들의 좌표값 객체를 담아놓을 곳.
    let i = 0;
    let width = 0;
    let pixel;

    // 모든 픽셀을 다 돌기 어려우니까 density 단위로 돌게 해줌.
    for (let height = 0; height < stageHeight; height += density) {
      ++i;
      const slide = i % 2 == 0;
      width = 0;
      if (slide == 1) {
        width += 6;
      }
      // i가 홀수면 width는 0, i가 짝수면 width는 6으로 for loop를 시작함.
      // 그래서 width값이 0과 6으로 번갈아가면서 for loop를 돌려줌.
      // 왜 이렇게 돌리는 건지는 아직도 잘 모르겠음ㅋㅋㅋ

      for (width; width < stageWidth; width += density) {
        // height - 1 번째 row까지의 픽셀 수를 전부 계산한 게 height * stageWidth
        // 여기에 height 번째 row에서 width번째 까지의 픽셀 수를 더해준 게 (width + (height * stageWidth))
        // 여기에 4를 곱하면 (width + (height * stageWidth)) + 1 번째 픽셀의 r값에 해당하는 index
        // 여기에 -1을 빼주면 (width + (height * stageWidth)) 번째 픽셀의 alpha값(투명도)에 해당하는 index
        pixel = imageData[(width + height * stageWidth) * 4 - 1];

        // alpha값이 0이 아닌, 즉 색상값이 존재하고,
        // 현재 브라우저 사이즈 내에 위치하는 픽셀들의 좌표값을 particles 배열에 차곡차곡 push해줌.
        if (
          pixel != 0 &&
          width > 0 &&
          width < stageWidth &&
          height > 0 &&
          height < stageHeight
        ) {
          particles.push({
            x: width,
            y: height,
          });
        }
      }
    }

    return particles; // 색상값이 존재하는 픽셀들의 좌표값이 담긴 배열을 리턴해 줌.
  }
}
