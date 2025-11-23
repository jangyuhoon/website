var input = document.querySelector('input')
var tagify = new Tagify(input);
  
// 태그가 추가되면 이벤트 발생
tagify.on('add', function() {
  console.log(tagify.value); // 입력된 태그 정보 객체
})