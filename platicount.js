// ==UserScript==
// @name         Plati count
// @namespace    http://tampermonkey.net/
// @version      1
// @description  try to take over the world!
// @author       Lyrapuff
// @match        https://www.plati.market/*
// @grant        none
// ==/UserScript==

(function() {
    let all_cart = document.getElementById('all_cats');
    if(all_cart !== null) {
        all_cart.innerHTML = `<button onclick="document.loadCount()" style="height:20px; margin-right:5px; margin-top:1px; background-color:#0090fe;border:none; outline: none; color:white;">Обновить остаток</button>` + all_cart.innerHTML;
        return;
    }

    let sortBy = document.getElementsByClassName('content_center')[0];
    sortBy.innerHTML = `<button onclick="document.loadCount()" style="height:20px; margin-right:5px; margin-top:1px; background-color:#0090fe;border:none; outline: none; color:white;">Обновить остаток</button>` + sortBy.innerHTML;
})();

document.loadCount = async () => {
    let tables = document.getElementsByClassName("goods-table");

    for (let i = 0; i < tables.length; i++) {
        let table = tables[i];
        let thead = table.getElementsByTagName("thead");
        let trHead = thead[0].getElementsByTagName("tr")[0];
        trHead.innerHTML = trHead.innerHTML + `<th style="width:20px; text-align:center">Ост.</th>`;

        let tbody = table.getElementsByTagName("tbody");
        let trBodies = tbody[0].getElementsByTagName("tr");

        for (let k = 0; k < trBodies.length; k++) {
            await new Promise(r => setTimeout(r, 100));

            let trBody = trBodies[k];

            let title = trBody.getElementsByClassName('product-title')[0];
            let titleDiv = title.getElementsByTagName('div')[0];
            let a = titleDiv.getElementsByTagName('a')[0];

            const regex = /(\d+)$/gm;
            let link = a.getAttribute('href');
            let id = link.match(regex)[0];

            let options = [];

            fetch("https://api.digiseller.ru/api/products/info?format=json&transp=cors&product_id=" + id)
                .then(response => {
                response.json().then(json => {
                    Array.from(json.product.options).map(option => {
                        options.push(option.name);
                    });

                    var myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                    var urlencoded = new URLSearchParams();
                    urlencoded.append("product_cnt", "1000000");
                    urlencoded.append("product_id", id);

                    options.map(option => {
                        urlencoded.append(option, "1");
                    });

                    var requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: urlencoded,
                        redirect: 'follow'
                    };

                    fetch("https://shop.digiseller.ru/xml/shop_cart_add.asp", requestOptions)
                        .then(response => {
                        response.json().then(json => {
                            trBody.innerHTML = trBody.innerHTML + `<td data-th="Остаток" style="width:20px; text-align:center; display:flex; align-items:center; justify-content:center;"><div><div>${json.cart_cnt}<span></span></div></div></td>`;
                        });
                    });
                });
            });
        }
    }
}
