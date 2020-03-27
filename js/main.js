window.onload=function(){
    
    var lokacija = window.location.pathname;
    if(lokacija.endsWith("/product.html")){
        window.addEventListener("unload", function(){
            this.localStorage.removeItem("trenutni");
        })
    }

    // Prethodni deo koda je rešavao bug da se pri povratku sa stranice product.html nakon klika na "buy" uračunava dupla kupovina zbog postojanja "trenutnog id" u local storage-u
    $( "#ispisListe2" ).hide();
    $("#nosac").scroll(function () { 
        $(this).addClass(".tamnaPozadina");
    });
    $.ajax({
        type: "get",
        url: "data/menu.json",
        success: function (data) {
            ispisiMenije(data);
        },
        error:function(error){
            console.log(error);
        }
    });
    $.ajax({
        type: "get",
        url: "data/products.json",
        success: function (data) {
            ispisiFilmove(data);
            if(localStorage.getItem("trenutni")){
                let kliknutId = localStorage.getItem("trenutni");
                var film = izdvojFilm(data, kliknutId);
                ispisiProduct(film);
            }
            ispisiCart(data);
        },
        error:function(error){
            console.log(error);
        }
    });
    $.ajax({
        type: "get",
        url: "data/social.json",
        success: function (data) {
            ispisiSocial(data);
        },
        error:function(error){
            console.log(error);
        }
    });
}
$("#btnSend").click(function(){
    var polje = document.getElementById("tbsubscribe");
    var emails = localStorage.getItem("emails");
    var regExp = /^([a-z0-9]{2,15}@[a-z]{2,10}\.[a-z]{2,5})(\.[a-z]{2,5})?$/;
    if(!regExp.test(polje.value)) {
        polje.value='';
        polje.classList.add("pogresanSubscribe");
        polje.placeholder="Enter right format (Ex. mike@gmail.com)";
    }
    else{
        if(emails){
            var preuzetiEmails = JSON.parse(emails);
            if(postojiLiULocaluMail(preuzetiEmails, polje.value)){
                polje.value='';
                polje.classList.add("pogresanSubscribe");
                polje.placeholder="You are already subscribed!";
            }
            else{
                var preuzetID = (preuzetiEmails[preuzetiEmails.length-1].id)+ 1;
                console.log(preuzetID);
                preuzetiEmails.push({
                    id:preuzetID,
                    email:polje.value
                })
                polje.classList.remove("pogresanSubscribe");
                localStorage.setItem("emails", JSON.stringify(preuzetiEmails));
                popUpSuccess("subscribe");
            }
        }
        else{
            var pocetniNiz = [];
            pocetniNiz.push({
                id:1,
                email:polje.value
            });
            polje.classList.remove("pogresanSubscribe");
            localStorage.setItem("emails", JSON.stringify(pocetniNiz));
            popUpSuccess("subscribe");

        }
    }
})
$("#topRated").click(function(){
$.ajax({
    type: "get",
    url: "data/products.json",
    success: function (data) {
        ispisiTopRated(data);
    },
    error:function(error){
        console.log(error);
    }
});
});
$("#newReleases").click(function(){
    $.ajax({
        type: "get",
        url: "data/products.json",
        success: function (data) {
            ispisiNewReleases(data);
        },
        error:function(error){
            console.log(error);
        }
    });
    });
$("#comingSoon").click(function(){
    $.ajax({
        type: "get",
        url: "data/products.json",
        success: function (data) {
            ispisiComingSoon(data);
        },
        error:function(error){
            console.log(error);
        }
    });
    })
window.addEventListener('scroll', dodaj);
$( "#hamburger" ).click(function() {
    $( "#ispisListe2" ).slideToggle();
});
$("#search").click(function () { 
    $.ajax({
        type: "get",
        url: "data/products.json",
        dataType: "json",
        success: function (data) {
            ispitajSve(data);
        }
    });
 })



// KREIRANJE FUNKCIJA

function ispitajSve(data){
    var search = $("#tbSearch").val();
    var sortiraj = $("#sort").val();
    var zanr = $("#categorySelect").val();
    var poCemu =$("option:selected", "#sort").data("oblast");
    var kako =$("option:selected", "#sort").data("sort");
    var noviNiz = data.filter(el=>{
        if (search ==""){
            var rezultatPretrage = true;
        }
        else rezultatPretrage = (el.naziv.toUpperCase().indexOf(search.toUpperCase())!=-1);
        if(zanr == "0"){
            var rezultatZanra = true;
        }
        else{ rezultatZanra = (el.zanr.id==zanr)}
        if(rezultatZanra && rezultatPretrage ){
            return el;
        }
    })
    var ispis = sortirajFilmove(noviNiz, poCemu, kako);
    ispisiFilmove(ispis);
}


function ispisiComingSoon(data){
    var noviNiz = data.filter(function(el){
        if(el.daLiJeIzasao==false){
            return el;
        }
    });
    ispisiFilmove(noviNiz);
}
function ispisiNewReleases(data){
    var noviNiz = data.filter(function(el){
        if(el.godinaIzlaska==2020 && el.daLiJeIzasao==true){
            return el;
        }
    });
    ispisiFilmove(noviNiz);
}
function dodaj(){
        document.querySelector("#navigacija").classList.add("tamnaPozadina");
}
function ispisiMenije(data){
    var ispis=""
    data.forEach(el => {
        ispis += `
        <li class="nav-item mx-3">
        <a class="nav-link" href="${el.href}">${el.name}</a>
        </li>
        `;
    })
    $("#ispisListe1").html(ispis);
    $("#ispisListe2").html(ispis);
}
function ispisiTopRated(data){
    var noviNiz = data.filter(function(el){
        if(el.brojZvezdica>=4){
            return el;
        }
    });
    ispisiFilmove(noviNiz);
}
function ispisiFilmove(data){
    if(data.length!=0){
        let ispis="";
        data.forEach(el=>{
            ispis+=`
            <div class="col-12 col-md-6 col-lg-3  float-left mb-4 film">
                <a href="product.html" data-id="${el.id}" class="pokupiId"><img src="img/${el.slika.naziv}" class="img-fluid rounded" alt="${el.slika.alt}"/></a>
                <h3><a href="product.html" data-id="${el.id}" class="filmNaslov mt-3 pokupiId">${el.naziv}<a></h3>
                <p class="text-secondary">${el.godinaIzlaska}, ${el.drzava}, ${el.zanr.naziv}</p>
                <ul class="list-unstyled mt-2">`;
                    if(el.daLiJeIzasao){
                        for(let i=0;i<5;i++){
                            if(i<el.brojZvezdica){
                                ispis+=`<li class="float-left text-warning"><i class="fas fa-star"></i></li>`;
                            }
                            else{
                                ispis+=`<li class="float-left text-warning"><i class="far fa-star"></i></li>`;
                            }
                        }
                        ispis+="<br/>";
                    }
                    else{
                        ispis+="Coming soon";
                    }
                ispis+= `</ul>
                <p class="price">&dollar;${el.cena}</p>
                <a href="#" data-id="${el.id}" class="buy">`;
                if(el.daLiJeIzasao){
                    ispis+="Buy now";
                }
                else{
                    ispis+="Preorder now";
                }
                ispis+=`</a>
            </div>
            `;
            $("#divZaIspis").html(ispis);
            osluskujKlik();
            $(".pokupiId").click(function(){
                localStorage.setItem("trenutni", this.dataset.id);
            });
            
        })
    }
    else{
        let ispis =`
            <p class="noProducts">No products found</p>
        `;
        $("#divZaIspis").html(ispis);
    }
}
function osluskujKlik(){
    $(".buy").click(function(e){
        e.preventDefault();
        let id = this.dataset.id;
        var films = localStorage.getItem("films")
        if(films){
            var preuzetiFilmovi = JSON.parse(films);
            if(postojiLiULocaluFilm(preuzetiFilmovi, id)){
                preuzetiFilmovi.forEach(el=>{
                    if(el.id == id){
                        el.kolicina++;
                        console.log(el);
                    }
                })
                localStorage.setItem("films", JSON.stringify(preuzetiFilmovi));
                popUpSuccess("shop");

            }
            else{
                preuzetiFilmovi.push({
                    id:id,
                    kolicina:1
                })
                localStorage.setItem("films", JSON.stringify(preuzetiFilmovi));
                popUpSuccess("shop");
            }
        }
        else{
            var pocetniNiz = [];
            pocetniNiz.push({
                id:id,
                kolicina:1
            });
            localStorage.setItem("films", JSON.stringify(pocetniNiz));
            popUpSuccess("shop");

        }
    })
}
function ispisiSocial(data){
    var ispis="";
    data.forEach(el=>{
        ispis+=`
        <li class="float-left mr-3"><a href="${el.href}" target="_blank" class="text-white"><i class="${el.izgled}"></i></a></li>`;
    })
    $("#footerUl").html(ispis);
}
function postojiLiULocaluMail(local, uzorak){
    let ispit =  local.filter(function(el){
        if(el.email == uzorak)return el;
    })
    if(ispit.length==0)return false;
    else return true;
}
function postojiLiULocaluFilm(local, uzorak){
    let ispit =  local.filter(function(el){
        if(el.id == uzorak)return el;
    })
    if(ispit.length==0)return false;
    else return true;
}
function popUpSuccess(type){
    if(type == "subscribe"){
        IspisiSubscribe();
    }
    if(type == "shop"){
        IspisiShop();
    }
    $("#popUp").finish().delay(200).fadeIn();
    $("#popUp").delay(1800).fadeOut();
}
function IspisiSubscribe(){
    let text = `<p class="text-center">Succefuly subscribed to newsletter</p>`;
    $("#popUp").html(text);
}
function IspisiShop(){
    let text = `<p class="text-center">Succefuly added to cart</p>`
    $("#popUp").html(text);
}
function izdvojFilm(data, uslov){
    let film = data.filter(el=>{
        if(el.id == uslov){
            return el;
        }
    })
    return film;
}
function ispisiProduct(data){
    let ispis = "";
    let naslov = "";
    data.forEach(el=>{
        ispis+=`
        <div class="col-lg-7 col-12 float-left pl-5 l-lg-0 mb-4 mb-lg-0">
        <div class="col-lg-6 float-left text-center">
            <img src="img/${el.slika.naziv}" class="img-fluid" alt="${el.slika.alt}"/>
            <p class="price mt-2 text-center d-block d-xl-none">&dollar;28.00</p>
            <a href="#" data-id="${el.id}" class="buy text-center d-block d-xl-none">`;
            if(el.daLiJeIzasao){
                ispis+="Buy now";
            }
            else{
                ispis+="Preorder now";
            }
            ispis+= `</a>
        </div>
        <div class="col-lg-6 float-left">
            <ul class="list-unstyled mt-3 mt-sm-0 mb-0">`;
            if(el.daLiJeIzasao){
                for(let i=0;i<5;i++){
                    if(i<el.brojZvezdica){
                        ispis+=`<li class="float-left text-warning"><i class="fas fa-star"></i></li>`;
                    }
                    else{
                        ispis+=`<li class="float-left text-warning"><i class="far fa-star"></i></li>`;
                    }
                }
                ispis+="<br/>";
            }
            else{
                ispis+="Coming soon";
            }
            ispis+= `</ul>
            </br>
            <p class="opis"><span class="font-weight-bold">Genre: </span> ${el.zanr.naziv}</p>
            <p class="opis"><span class="font-weight-bold">Release year: </span> ${el.godinaIzlaska}</p>
            <p class="opis"><span class="font-weight-bold">Running time:</span>${el.trajanje} min</p>
            <p class="opis"><span class="font-weight-bold">Country:</span> ${el.drzava}</p>
            <p class="mt-1 opis">${el.opis}</p>
            <p class="price mt-2 d-none d-xl-block">&dollar;${el.cena}</p>
            <a href="#" data-id="${el.id}" class="buy d-none d-xl-block">`;
            if(el.daLiJeIzasao){
                ispis+="Buy now";
            }
            else{
                ispis+="Preorder now";
            }
            ispis+=`</a>
        </div>
    </div>
    <div class="col-lg-5 col-12 float-left embed-responsive embed-responsive-16by9 mt-3">
        <iframe class="embed-responsive-item " src="${el.videoSrc}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
        `;
        naslov +=`
        <h2 class="text-uppercase medjunaslov font-weight-bold text-center">${el.naziv}</h2>
        `
    })
    $("#productZaIspis").html(ispis);
    osluskujKlik();
    $("#naslovIspis").html(naslov);
}
function sortirajFilmove(niz, kriterijum, nacin){
    if(kriterijum == "all" && nacin=="all"){
        return niz;
    }
    else{
        niz.sort(function(a, b){
            if(kriterijum=="price") {
                var novoA = a.cena;
                var novoB = b.cena;
            }
            if(kriterijum=="letter") {
                var novoA = a.naziv;
                var novoB = b.naziv;
            }
            if(nacin == "ascending"){
                if(novoA > novoB){
                    return 1;
                }
                if(novoA < novoB){
                    return -1;
                }
                if(novoA == novoB){
                    return 0;
                }
            }
            if(nacin == "descending"){
                if(novoA > novoB){
                    return -1;
                }
                if(novoA < novoB){
                    return 1;
                }
                if(novoA == novoB){
                    return 0;
                }
            }
        })
        return niz;
    }
}
function ispisiCart(data){
    let naruceno = JSON.parse(localStorage.getItem("films"));
    // console.log(naruceno);
    if(naruceno && naruceno.length!=0){
        let izvuceno =  data.filter(el=>{
            for(let film of naruceno){
                if(el.id == film.id){
                    el.kolicina = film.kolicina;
                    return el;
                }
            }
        })
        popuniCart(izvuceno);
    }
    else{
        let ispis = `
            <p class="noProducts mb-1">There are no products in cart</p>
        `;
        $("#tabelaIspis").html(ispis);
    }
}
function popuniCart (data) { 
    if(data && data.length!=0){
        let suma=0;
        let ispis=`
            <div class="table-responsive">
            <table class="table table-striped text-center" id="tabela">
                <thead class="w-100">
                    <tr class="crvena text-white">
                        <th scope="col"></th>
                        <th scope="col">Product</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Total</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(el=>{
            suma+=el.cena*el.kolicina;
            ispis+=`
            <tr>
                <td><a class="trash" href="#" data-id="${el.id}"><i class="fas fa-trash"></i></a></td>
                <td><a href="product.html" data-id="${el.id}" class="pokupiId">${el.naziv}</a></td>
                <td>&dollar;${el.cena}</td>
                <td><input type="number"  min="1" value="${el.kolicina}" class="col-12 col-sm-5 col-md-3 col-lg-2 kartKolicina" name="${el.id}" id="${el.id}" data-id="${el.id}"></td>
                <td>&dollar;${el.cena * el.kolicina}</td>
            </tr>
            `;
        })
        ispis+=`
                <tr>
                <td colspan="5" class="crvena text-white">Cart total:  <span class="font-weight-bold ml-3">&dollar;${suma}</span></td>
                </tr>
            </tbody>
        </table>
        <div class="row d-flex justify-content-center">
            <button class="btn font-weight-bold crvena text-white py-2 my-4 btn col-6 col-sm-3 col-md-2 col-lg-2 hover">Checkout</button>
        </div>
        `;
        $("#tabelaIspis").html(ispis);
        $(".kartKolicina").change(function(){
            let trenutniId = $(this).data("id");
            let vrednost = $(this).val();
            let filmovi = JSON.parse(localStorage.getItem("films"));
            for(let film of filmovi){
                if(film.id == trenutniId){
                    film.kolicina = vrednost;
                }
            }
            localStorage.setItem("films", JSON.stringify(filmovi));
            ispisiCart(data)
        });
        $(".trash").click(function(e){
            e.preventDefault();
            console.log(data);
            var trenutniId = $(this).data("id");
            // console.log(trenutniId);
            let izvuceno =  data.filter(el=>{
                    if(el.id != trenutniId){
                        return el;
                    }
            });
            console.log(izvuceno);
            popuniCart(izvuceno);
            localStorage.setItem("films", JSON.stringify(izvuceno));

            
        })
        $(".pokupiId").click(function(){
            localStorage.setItem("trenutni", this.dataset.id);
        })
    }
    else{
        let ispis = `
            <p class="noProducts mb-1">There are no products in cart</p>
        `;
        $("#tabelaIspis").html(ispis);
    }
 }
function provera(){

let mail = document.getElementById("tbEmail");
let regExpMail = /^([a-z0-9]{2,15}@[a-z]{2,10}\.[a-z]{2,5})(\.[a-z]{2,5})*$/;
let mailText = "Enter your mail in right format (Ex. mike@gmail.com)";
let number = document.getElementById("tbNumber");
let regExpNumber = /^\+?[0-9]{9,15}$/;
let numberText = "Wrong mobile number format (Ex. +381621235234)";
let message = document.getElementById("mesageText");
let regExpName = /^[A-ZĐŠĆŽČ][a-zšđćžč]{1,14}$/;
let regExpLastName=/^([A-ZĐŠĆŽČ][a-zšđćžč]{1,14})+(\s[A-ZĐŠĆŽČ][a-zšđćžč]{1,14})*$/;
let nameText="Enter the name in right format (Ex. Jhon)";
let lastNameText="Enter your last name in right format (Ex. Miles)";
let name = document.getElementById("tbName");
let lastName = document.getElementById("tbLastName");

if(proveraTb(name, regExpName, nameText)&&(proveraTb(lastName, regExpLastName, lastNameText))&&(proveraTb(mail, regExpMail, mailText))&& (proveraTb(number, regExpNumber, numberText)))  return true;
else return false;
}
function proveraTb(polje, regExp, text){
    if(!regExp.test(polje.value)){
        polje.classList.add("pogresanSubscribe");
        polje.placeholder=text;
        polje.value="";
        return false;
    }
    else {
        polje.classList.remove("pogresanSubscribe");
        return true;
    }   
}