"use strict";

// 랜덤으로 선택할 text string값인 RANDOM_TEXT를 가져와서 여기에서도 사용함
import { RANDOM_TEXT } from "./visual.js";

const FRICTION = 0.86;
const COLOR_SPEED = 0.12;
// MOVE_SPEED 값이 없는 이유.
// 얘는 sprite들을 원래 위치로 서서히 돌아오게 만드는 const값이잖아.
// 근데 여기서는 한 번 흩어진 particle들이 원래 자리로 돌아오지 않아도 되니까 이 값을 할당해주지 않은 것.

export class Particle {
  constructor(pos) {
    // 또 typo3에서는 sprite을 생성할 필요가 없음.
    // 왜? particle을 텍스트로 대체할 거니까. 그러니 이미지를 texture로 변환하는 작업도 필요가 없지.

    this.savedX = pos.x;
    this.savedY = pos.y; // 초기 particle의 x, y값(색상값이 존재하는 픽셀들의 좌표값으로 넣어줌.)
    this.x = pos.x;
    this.y = pos.y; // 이동시킬 particle의 x,y좌표값
    this.vx = 0;
    this.vy = 0; // 이동시킬 좌표값의 변화량
    this.radius = 10; // particle을 둘러싸는 영역, 반경의 반지름

    /**
     * split(separator, limit) 메서드는 String 객체를 지정한 구분자를 이용하여 여러 개의 문자열로 나눠줌.
     *
     * optional한 parameter가 2개 전달될 수 있음. 전달 안해도 되고.
     * 1. separator: 원본 문자열을 끊어야 할 부분, 즉 구분자를 문자열 형태로 전달해줌. 얘를 기준으로 문자열들이 나눠짐.
     * 2. limit: 끊어진 문자열의 최대 개수를 나타내는 정수. 배열의 원소가 limit개를 넘어가면 문자열 끊기를 멈춤.
     *
     * return값은 주어진 문자열을 separator 기준으로 끊은 부분 문자열들을 담은 Array
     *
     * 따라서 여기서는 'ABCMNRSTUXZ'라는 string 객체를
     * ''라는 구분자를 기준으로 끊어줌. 띄어쓰기 없는 구분자는 그냥 알파벳 하나하나를 끊어줌.
     * this.textArr에는 해당 알파벳들을 모아놓은 배열이 할당될거임.
     */
    this.textArr = RANDOM_TEXT.split("");
    this.cur = 0; // this.textArr의 알파벳들에 15fps 속도로 순서대로 접근해 줄 index값
    this.total = this.textArr.length; // 알파벳 전체 개수가 할당되겠지

    // 60fps를 15fps로 보이도록 하려나 봄.
    this.fps = 15;
    this.fpsTime = 1000 / this.fps; // 한 프레임에서 다음 프레임까지 걸리는 시간. 대략 66.666...ms

    this.savedRgb = 0x000000; // particle의 초기 색상값
    this.rgb = 0x000000; // 매 프레임마다 변화할 현재 색상값
  }

  collide() {
    // 마우스 움직임에 의해 이동한 particle들에 한해서
    // 이 색상값부터 시작해서 초기 색상값으로 서서히 바뀌도록 계산해줄거임.
    this.rgb = 0xf3316e;

    // 또 마우스 움직임에 의해 이동한 particle들에 한해서만
    // 현재 this.textArr에 들어있는 알파벳 요소들을 랜덤으로 섞어서 override 해줌.
    this.textArr = this.shuffle(this.textArr);
  }

  draw(ctx, t) {
    // 해당 particle의 색상값을 0xf3316e로 override한 뒤 서서히 초기 색상값으로 바꿔주는 거
    this.rgb += (this.savedRgb - this.rgb) * COLOR_SPEED;

    // 참고로 draw 메소드가 전달받은 t값은 거슬러가서 확인해보면 app.js의
    // requestAnimationFrame에서 매 프레임마다 콜백함수로 넘겨준 DOMHighResTimeStamp가 들어있음.
    // requestAnimationFrame이 매 프레임마다 콜백에 리턴해주는 타임 스탬프값을 이용하여
    // 60fps -> 15fps로 애니메이션이 렌더되는 것처럼 보이게 해주려는 것.
    // sheep.js에 해당 내용에 대해 자세하게 적혀있으니 참고할 것. 코드 구조도 완전히 동일함.
    if (!this.time) {
      // t값은 참고로 매 프레임이 지날때마다 16.66...ms가 더해진 값이 될거임. 계속 증가한다는 뜻.
      // 왜? requestAnimationFrame은 한 프레임에서 다음 프레임까지 60fps, 즉, 16.66...ms가 걸리니까.
      // 그리고 위에 !this.time은 this.time의 값이 비어있을 때, 즉 첫번째 프레임일 경우에 해당하니까
      // 첫 프레임의 타임스탬프 값이 this.time에 할당되서 사용될거임.
      this.time = t;
    }

    // 첫 프레임에서 t와 this.time은 같은 값이므로 now는 0이고
    const now = t - this.time;
    // 이 now값은 t값이 매 프레임마다 16.66..ms가 누적될수록 점점 커질거임.

    // now가 계속 커져도 this.fpsTime(66.66..ms)보다 작다면 if block을 실행하지 않지만,
    // 어느 순간 우리가 정한 fps값인 this.fpsTime보다 커진다면 if block을 수행할거임.
    if (now > this.fpsTime) {
      // 결국 16.66..ms가 계속 누적되면서 this.fpsTime보다 큰 now값을 계산해준 t를
      // this.time에 override해줘서 다음 프레임부터는 다시 now가 this.fpsTime보다 작아지게 해줄 수 있도록 함.
      // 즉, this.cur의 증가를 지연시켜주도록 함.
      this.time = t;
      this.cur += 1; // if block을 수행할 때마다 접근해줄 index값을 1씩 증가. 15fps의 속도로 증가할거임.
      if (this.cur == this.total) {
        // this.textArr에 들어있는 알파벳 개수와 같아졌을 때 this.cur에 들어갈 index값을 다시 0으로 초기화
        // 아! 결국 this.textArr안에 있는 알파벳들을 15fps 속도로 접근해서 바꿔주려는 거였군
        this.cur = 0;
      }
    }
    // 중요한 것은 여기서 실제 fps를 60fps -> 15fps로 바꿔준 게 아니라,
    // 15fps처럼 보이도록 만들어준거임. 헷갈리지 말 것

    this.vx *= FRICTION;
    this.vy *= FRICTION; // x, y의 이동량을 매 프레임마다 서서히 줄이기 위해 곱해준 값(마찰력)

    this.x += this.vx;
    this.y += this.vy;

    /**
     * 비트 연산자
     *
     * 비트 연산자는 피연산자를 10진수, 16진수, 8진수가 아니라, 32개의 비트(0과 1) 집합으로 취급함.
     * 비트 연산자는 값의 2진수 표현을 사용해 연산하지만, 결과는 표준 JavaScript 숫자 값, 즉 10진수로 반환함.
     *
     * 그니까 10진수나 16진수인 피연산자를 비트 연산자로 계산하더라도,
     * 피연산자들을 32개 자릿수의 2진수로 변환한 다음 연산해서 그 결과값을 다시 10진수로 return해준다는 뜻.
     * 근데 일반적인 웹 개발에서는 비트 연산자를 쓸 일이 거의 없다고도 함...
     *
     * 여기에서 사용된 비트 연산자들은 다음과 같다.
     * 자세한 내용은 <자바스크립트 비트 연산자> 북마크 해놓은 페이지 참고
     *
     * - 비트 AND ( & )
     * 두 피연산자의 대응되는 비트가 모두 1이면 1을 반환.
     *
     * - 비트 OR ( | )
     * 두 피연산자의 대응되는 비트에서 둘 중 하나가 1이거나 모두 1인 경우 1을 반환.
     *
     * - 왼쪽 시프트(LEFT SHIFT) ( << )
     * a << b
     * a의 2진수 표현을 b 비트만큼 왼쪽으로 이동함. 오른쪽은 0으로 채움.
     *
     * - 오른쪽 시프트(RIGHT SHIFT) ( >> )
     * a >> b
     * a의 2진수 표현을 b 비트만큼 오른쪽으로 이동함. 오른쪽 남는 비트는 버림.
     *
     * 여기서는 위의 네 가지 비트 연산자를 이용해서
     * 현재 프레임의 this.rgb 값에 따라 각 particle에 해당하는 text의 rgb값을 계산함.
     * 참고로 0xFF는 10진수로 표현하면 255에 해당함. (각 rgb값들의 가장 큰 값에 해당하지?)
     * 255를 2진수로 표현하면 11111111에 해당함.
     */
    const red = ((this.rgb >> 16) & 0xff) | 0;
    const green = ((this.rgb >> 8) & 0xff) | 0;
    const blue = (this.rgb & 0xff) | 0;
    const color = `rgb(${red}, ${green}, ${blue})`;
    // 매 프레임마다 렌더되는 알파벳 텍스트에 넣어줄 컬러값 할당

    // particle마다 랜덤으로 할당받은 this.textArr의 각 알파벳에 순서대로 접근하기 위해
    // 15fps의 속도로 this.cur이 +1씩 증가되서 index로 들어감.
    // str에는 this.textArr에 존재하는 각각의 알파벳이 매번 순서대로 할당되겠지.
    const str = this.textArr[this.cur];

    // 이제 여기서부터 실제 canvas에 작은 text particle를 그려주는 부분
    ctx.beginPath();
    ctx.fillStyle = color;

    const fontWidth = 700; // Web Font Loader에서 로드해온 폰트의 굵기
    const fontSize = 14;
    const fontName = "Hind";
    ctx.font = `${fontWidth} ${fontSize}px ${fontName}`;
    ctx.textBaseline = "middle";
    const textPos = ctx.measureText(str); // 캔버스에 렌더되는 텍스트에 대한 TextMetrics을 리턴받음.
    ctx.fillText(
      str,
      this.x - textPos.width / 2, // 렌더될 particle text의 x좌표값. this.x를 particle text의 가운데에 위치시키려는 것
      this.y + (fontSize - textPos.actualBoundingBoxAscent) / 2
      // 렌더될 particle text의 y좌표값. this.y도 가운데로 오게 하려는건가? 실제로 렌더될 때 테스트해볼 것
    );
  }

  // 위에서 만든 this.textArr를 전달받은 후,
  // 해당 배열내에 문자열 요소들을 무작위로 섞어주는 메소드를 sort를 이용해서 정의함.
  shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }
  /**
   * array.sort(compareFunction)
   *
   * sort 메소드는 기본적으로 배열의 요소를 정렬해 줌.
   * 배열 자체가 변경되기도 하고, 변경된 배열을 리턴해주기도 하는데,
   * 변경된 배열을 사용하면 되기 때문에 굳이 리턴값을 사용하지는 않는 편.
   *
   * sort의 parameter로 들어가는 compareFunction은 '새로운 정렬 기준을 만들어주는 함수'를 뜻함.
   * sort는 특정 함수를 넘겨주지 않는 이상
   * '배열 내의 모든 요소를 문자형으로 변환한 뒤, 각 문자열의 유니코드 값 순서로 요소들을 비교하여 재 정렬함.'
   * 그래서 숫자 정렬에서는 9가 80보다 앞에 오지만 이 숫자들도 문자열로 변환되기 때문에 80은 유니코드 순서 상 9보다 앞에 옴.
   * 이렇게 숫자 상으로는 앞에 와야 할 요소가 유니코드로 변환되면서 뒤로 가게 되는 경우가 많다.
   *
   * 그래서 오름차순이나 내림차순 등과 같이 내가 원하는 기준에 따라 배열의 요소를 정렬하고 싶으면
   * 정렬 기준을 정의해주는 정렬함수(compareFunction)을 parameter로 전달해줘야 한다.
   * 이 때 정렬 함수는 1. 반드시 값 두 개를 비교해야 하고 2. 반환값이 존재해야 한다.
   *
   * compareFunction이 제공되면 sort는 정렬함수의 반환값에 따라 요소들을 정렬해 줌.
   * compareFunction(a, b)이 0보다 작은 값을 반환하면, a(첫번째 parameter)를 b(두번째 parameter)보다 낮은 인덱스로 정렬. 즉, a가 먼저 오게 함.
   * compareFunction(a, b)이 0을 반환하면, a와 b를 서로에 대해 변경하지 않고 모든 다른 요소에 대해 정렬함.
   * compareFunction(a, b)이 0보다 큰 값을 반환하면, b(두번째 parameter)를 a(첫번째 parameter)보다 낮은 인덱스로 정렬. 즉, b가 먼저 오게 함.
   *
   * 그래서 예전에 Array API를 공부할 때에도 배웠지만,
   * array.sort((a, b) => a - b); 하면
   * a - b < 0 이면 a가 먼저 오고,
   * a - b > 0 이면 b가 먼저 오도록 정렬하니까 작은 값일수록 앞쪽에 정렬함. 그래서 오름차순으로 정렬해 줌.
   * 반면, array.sort((a, b) => b - a); 하면
   * b - a < 0 이면 a가 먼저 오고,
   * b - a > 0 이면 b가 먼저 오도록 정렬하니까 오히려 큰 값일수록 앞쪽에 정렬함. 그래서 내림차순으로 정렬해 줌.
   *
   * 정렬함수 내부의 계산식이 어떻게 되었든 간에,
   * compareFunction(a, b)이 return해주는 값이 0보다 작으면 무조건 a, 즉 첫번째 parameter인 배열요소를 먼저 정렬해주고
   * 0보다 크면 무조건 b, 즉 두번째 parameter인 배열요소를 먼저 정렬해주는 sort()의 성질을 이용한 것
   *
   *
   * 이러한 sort를 이용하면, 배열의 요소를 무작위로 섞어주는 함수 shuffle(array)도 만들어볼 수 있다.
   *
   * function shuffle(array) {
   *  array.sort(() => Math.random() - 0.5);
   * }
   *
   * 가장 간단하게는 이런 식으로 코드를 작성해줄 수 있다.
   * 일단 sort안에 작성된 정렬함수에는 두 개의 parameter가 따로 전달되지는 않았는데,
   * 이런 경우 sort 메소드가 알아서 정렬함수에 두 개의 값을 임의로 전달해주는 것 같다. 작동이 잘 되는 것을 보면...
   *
   * 따라서 정렬함수 내에 계산식만 살펴보면 되는데,
   * Math.random() 자체가 0 ~ 1 사이의 숫자를 랜덤으로 return해주니까
   * Math.random() - 0.5의 결과값은
   * 0 ~ 4.999... - 0.5 < 0
   * 0.5 ~ 0.999... - 0.5 > 0
   * 두 가지의 케이스로 나올 확률이 각각 반반이므로,
   * 정렬함수가 반반의 확률로 0보다 작거나 0보다 큰 값을 반환해줄것임.
   * 또 그 값이 매번 무작위로 반환되기 때문에
   * 정렬함수에 임의로 전달될 두 개의 값 중 어느 요소가 앞쪽에 정렬될 것인지 또한 매번 무작위이다.
   *
   * 이런 식으로  배열의 모든 요소가 매번 무작위로 재정렬 되므로
   * shuffle(array)함수를 실행할 때마다 배열 요소를 무작위로 섞어주게 된다.
   *
   * 그런데 sort는 이렇게 배열의 요소를 무작위로 섞어줄 용도로 만들어진 메소드가 아니기 때문에
   * 위와 같이 코드를 작성하면 배열의 요소로 만들 수 있는 모든 순열들이 같은 빈도로 나타나지 않음.
   *
   * 그니까 예를 들어 [1, 2, 3]이라는 배열을 위와 같은 코드로 10만번을 무작위 재정렬 해준다면
   * [2, 1, 3] 조합이 5만번 나올 때 [3, 2, 1] 조합은 2만번 나오고 이럴 수 있다는 뜻.
   * 각 순열이 조합되는 빈도? 확률이 제각각임.
   * 이러면 아무리 랜덤으로 섞어준다고 해도 결과가 한쪽으로 쏠릴 수 있음.
   *
   * 이런 문제를 해결해주기 위해서 피셔-예이츠 셔플(Fisher-Yates shuffle) 알고리즘을 사용할 수 있는데
   * 자세한 내용은 js 한국어 튜토리얼에서 <배열 요소 무작위로 섞기>에 잘 정리되어 있으니 참고할 것.
   */
}
