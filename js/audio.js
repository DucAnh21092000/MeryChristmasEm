const audio = document.querySelector('.audio')
const abcd = document.querySelector('.abcd')

function openVolumn() {
    audio.play();

}
const muted = () => {
    audio.pause()
}

let initialValue = {
    content1: ` Chúc em một mùa Giáng Sinh vui vẻ. Cảm ơn em đã tin tưởng và đến với anh trong suốt thời gian qua.
    Dẫu vui, vui buồn xảy ra nhiều nhưng tới bây giờ mình vẫn còn ở bên nhau.
    `,
    content2: ``
}

setTimeout(() => {
   abcd.innerHTML= `
    Chúc em một mùa Giáng Sinh vui vẻ.Cảm ơn em đã tin tưởng và đến với anh trong suốt thời gian qua.
    Dẫu vui, vui buồn xảy ra nhiều nhưng tới bây giờ mình vẫn còn ở bên nhau.
   `;
},20000)

setTimeout(() => {
    abcd.innerHTML = `
   Cảm ơn em vì tất cả. Yêu em. ❤️
   `;
}, 40000)