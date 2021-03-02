"use strict";

// 임시 캔버스에 텍스트가 어떻게 렌더되는지 보려고 테스트삼아 작성한 것.
// 나중에 실제 캔버스에 렌더할 때는 지워줄거임.
// import { Text } from "./text.js";
import { Visual } from "./visual.js";

class App {
  constructor() {
    // 여기에는 text particle들을 실제로 렌더해서 화면에 보여줄거임
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");

    // 현재 모니터가 레티나를 지원할 정도가 되면 2, 아니면 1을 리턴해줌
    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

    // window가 로드되자 마자 링크로 연결한 Web Font Loader 라이브러리에서 구글 폰트 가져옴.
    WebFont.load({
      google: {
        families: ["Hind:700"],
      },
      fontactive: () => {
        // 임시 캔버스에 텍스트가 어떻게 렌더되는지 보려고 테스트삼아 작성한 것.
        // 실제 캔버스에 렌더할 때는 지워줄거임.
        /*
        this.text = new Text();
        this.text.setText(
          "A",
          2,
          document.body.clientWidth,
          document.body.clientHeight
        );
        */

        // Web Font를 로드 받아서 렌더하면 Visual 인스턴스를 생성한 뒤
        // 리사이징 이벤트를 걸고, this.resize 메소드를 호출하고,
        // this.animate()를 호출해 줌.
        this.visual = new Visual();

        window.addEventListener("resize", this.resize.bind(this), false);
        this.resize();

        requestAnimationFrame(this.animate.bind(this));
      },
    });
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    // 리사이징 이벤트가 발생할 때마다 변경된 브라우저 사이즈값을 가져와서
    // this.visual.show()메소드를 호출하여
    // 사이즈가 변경된 브라우저의 가운데에 랜덤하게 알파벳을 임시 캔버스에 렌더해줌
    // 그럼 브라우저 사이즈가 변경될 때마다 임시 캔버스에 렌더되는 알파벳도 달라지겠지?
    this.visual.show(this.stageWidth, this.stageHeight);
  }

  animate(t) {
    requestAnimationFrame(this.animate.bind(this)); // 내부에서 호출해서 반복할 수 있도록

    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight); // 매 프레임마다 실제 캔버스를 한번씩 지워주고 다시 그려줌

    // 매 프레임마다 requestAnimationFrame로부터 타임스탬프값을 전달받아서
    // 15fps의 속도로 각 particle text들의 좌표값과 색상값을 변경해 줌
    // 이렇게 해주면 초반에는 모든 text particle들이 동일한 순서로 바뀌어서 렌더됨.
    // 왜냐면 Particle 인스턴스들이 맨 처음 생성될 때는
    // this.textArr = ['A', 'B', 'C', 'M', 'N', 'R','S', 'T', 'U', 'X', 'Z'];
    // 위와 같이 동일한 알파벳 순서의 배열들로 애니메이션을 만들어낼 것이기 때문.
    // 마우스가 특정 text particle의 최소 유지 거리를 침범했을 때에만
    // 해당 text particle에 collide 메소드가 호출되서 this.textArr 배열을 무작위로 섞어줌.
    // 그래서 최소 유지 거리를 침범당한 text particle들만 text가 바뀌는 순서가 달라지게 됨
    this.visual.animate(this.ctx, t);
  }
}

window.onload = () => {
  new App();
};
