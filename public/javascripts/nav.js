
document.querySelector("#menu")
.addEventListener("click",function(){
        gsap.to("#side_nav",{
            display:"initial",
            x:0,
            ease:Expo.easeInout,
            duration:1
        }) 
})


document.querySelector(".cancel")
.addEventListener("click",function(){
        gsap.to("#side_nav",{
            display:"none",
            x:1000,
            ease:Expo.easeInout,
            duration:2
        }) 
})

