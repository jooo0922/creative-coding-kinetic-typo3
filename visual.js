"use strict";

// 이전에 했던 것들처럼 visual.js에서 Text, Particle 인스턴스를 생성해 줌.
// typo1, 2와 거의 동일한 구조
import { Text } from "./text.js";
import { Particle } from "./particle.js";

// typo3에서는 랜덤으로 선택할 text string값을 할당해서 export 해놓음.
// 참고로 export 키워드는 변수, 함수, 클래스, 배열, 상수 등을 모두 내보내기 할 수 있음.
export const RANDOM_TEXT = "ABCMNRSTUXZ";

export class Visual {
  constructor() {
    this.text = new Text(); // Text 인스턴스를 생성해 임시 캔버스를 만듦

    this.textArr = RANDOM_TEXT.split(""); // 문자열을 알파벳 단위로 끊어서 배열로 만듦
    // 여기서 랜덤 알파벳 배열을 또 만들어서 사용해주는 이유?
    // particle text가 아닌, 임시 캔버스에 렌더하는 커다란 텍스트들도 이 배열의 알파벳 중에서 무작위로 가져와서 렌더해주려고!

    this.particles = []; // 색상값이 존재하는 픽셀의 좌표값들로 만든 Particle 인스턴스들을 담아놓을 빈 배열

    // 마우스가 움직인 좌표값괌 마우스 주변을 둘러싼 반경(영역)의 반지름값을 저장함
    this.mouse = {
      x: 0,
      y: 0,
      radius: 100,
    };

    document.addEventListener("pointermove", this.onMove.bind(this), false);
  }

  show(stageWidth, stageHeight) {
    // 여기는 particle.js에서와 달리 15fps의 속도로 this.textArr에 index를 바꿔줄 필요가 없으므로
    // 리사이징 이벤트가 발생할 때마다 index값을 랜덤으로 바꿔줌
    // this.textArr.length가 11이니까 0이상 10미만의 랜덤한 숫자를 리턴받은 뒤
    // 소수점 이하를 반올림한 정수값을 index로 넣어줄테니
    // index가 0 ~ 10사이의 정수값이 들어갈 것.
    // 즉, this.textArr의 알파벳들 중 하나가 랜덤하게 str에 할당되겠지.
    const str = this.textArr[
      Math.round(Math.random() * (this.textArr.length - 1))
    ];

    // 위에서 랜덤하게 할당받은 this.textArr에 담긴 알파벳 중 하나를 리사이징된 브라우저 사이즈에 맞게
    // 위치시켜서 임시 캔버스에 렌더함.
    // 이 때, density가 26이니까 text particle들이 렌더될 좌표값 배열(색상값이 존재하는 픽셀들의 좌표값)이
    // 띄엄띄엄 할당받아서 return해주겠지
    this.pos = this.text.setText(str, 26, stageWidth, stageHeight);

    this.particles = [];
    // 색상값이 존재하는 픽셀들 좌표값 개수만큼 for loop를 돌려서
    // Particle 인스턴스를 만들고 this.particles에 차곡차곡 push해놓음.
    for (let i = 0; i < this.pos.length; i++) {
      const item = new Particle(this.pos[i]);
      this.particles.push(item);
    }

    // typo1, 2와 달리 PIXI의 ParticleContainer나 root container를 사용하지 않기 때문에
    // root container에 추가해주는 일들을 하지 않아도 됨.
  }

  animate(ctx, t) {
    for (let i = 0; i < this.particles.length; i++) {
      const item = this.particles[i];

      // 최소 유지 거리를 침범할 시 text particle을 움직여주는 코드 작성.
      // 구조는 typo1,2와 동일하므로 참고할 것.
      const dx = this.mouse.x - item.x;
      const dy = this.mouse.y - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // 각 text particle들의 가운데 지점과 현재 마우스가 움직인 지점 사이의 거리를 구해줌.

      // 최소 유지 거리를 구해 줌.
      const minDist = item.radius + this.mouse.radius;

      // 마우스가 움직인 지점과 각 text particle 사이의 거리들 중에서
      // 최소 유지 거리를 침범당한 text particle들에 대해서만 if block을 수행함.
      if (dist < minDist) {
        // 우선 atan2를 이용해서 현재 마우스 지점과 침범당한 text particle 지점을 연결한
        // 벡터의 각도, 기울기를 구해주고
        const angle = Math.atan2(dy, dx);

        // tx, ty는 위에서 구한 각도의 벡터 상에서
        // 마우스가 최소 유지 거리를 유지하려면 원래 있어야할 지점의 x,y좌표값이 할당됨.
        const tx = item.x + Math.cos(angle) * minDist;
        const ty = item.y + Math.sin(angle) * minDist;

        // ax, ay에는
        // 마우스가 원래 있어야 할 tx, ty상에서 현재 마우스 지점이 얼만큼 침범했는지
        // x, y좌표값 각각에 침범한 거리값이 할당됨.
        const ax = tx - this.mouse.x;
        const ay = ty - this.mouse.y;

        // 실제 마우스가 원래 있어야 할 tx, ty에서 침범한 거리(ax, ay)만큼
        // 침범당한 text particle들을 뒤로 물려줌
        item.vx -= ax;
        item.vy -= ay;

        // 침범당한 text particle에 한해서 collide를 수행하여
        // 색상값을 변화시키기 시작하고, this.textArr의 순서도 무작위로 섞어줌
        // 침범당하지 않는 text particle들과 다른 순서로 바뀌게 될 것
        item.collide();
      }

      // 매 프레임마다 app.js에서 타임스탬프 값을 가져온 뒤
      // 각각의 particle 인스턴스들의 draw()메소드에 넘겨준 뒤 호출함으로써
      // 각각의 text particle들의 색상값 및 좌표값을 15fps의 속도로 바꿔줌
      item.draw(ctx, t);
    }
  }

  // 마우스가 움직일 때마다 좌표값을 this.mouse에 override해줌.
  onMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
}
