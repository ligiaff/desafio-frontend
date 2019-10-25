// Compras
class Purchase {
    constructor(transactionId, date, location) {
        this.transactionId = transactionId
        this.date = date
        this.location = location
        this.products = []
    }

    getDate() {
        let day = this.date.getDate()
        let year = this.date.getFullYear()
        let month = this.date.getMonth() + 1
        let formattedDay = day < 10 ? '0' + day : day
        let formattedMonth = month < 10 ? '0' + month : month

        return `${formattedDay}/${formattedMonth}/${year}`
    }

    getHour() {
        let hour = this.date.getHours()
        let minute = this.date.getMinutes()
        let formattedHour = hour < 10 ? '0' + hour : hour
        let formattedMinute = minute < 10 ? '0' + minute : minute

        return `${formattedHour}:${formattedMinute}`
    }

    getTotalPrice() {
        return this.products.map(p => p.price).reduce((accum, curr) => accum + curr)
    }
}
 
// Produtos
class Product {
    constructor(name, price) {
        this.name = name
        this.price = price
    }
}

// Converter moeda para Real
function formatToReal(price) {
    let formattedPrice = price.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})
    return formattedPrice
}

function loadData() {
    let obj
    let xhttp = new XMLHttpRequest()


    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                obj = JSON.parse(this.responseText)

                let purchases = []

                // Compras
                obj.events
                    .filter(r => r.event === "comprou")
                    .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .forEach(r => {
                        let date = new Date(r.timestamp)
                        let transactionId = r.custom_data.filter(c => c.key === 'transaction_id')[0].value
                        let storeName = r.custom_data.filter(c => c.key === 'store_name')[0].value
                        
                        purchases.push(new Purchase(transactionId, date, storeName))
                    })                

                // Produtos
                obj.events
                    .filter(r => r.event === "comprou-produto")
                    .forEach(r => {
                        let transactionId = r.custom_data.filter(c => c.key === 'transaction_id')[0].value
                        let name = r.custom_data.filter(c => c.key === 'product_name')[0].value
                        let price = r.custom_data.filter(c => c.key === 'product_price')[0].value
                        
                        let product = new Product(name, price)
                        let purchase = purchases.filter(p => p.transactionId === transactionId)[0]
                        
                        purchase.products.push(product)
                    })

                /* Criar HTML */
                purchases.forEach(purchase => {
                    let eventsList = document.getElementById('eventsList') 
                    let content = 
                        `<div class="timeline__icon">
                                <img src="assets/icons/check.svg" alt="">
                            </div>
                            <div class="timeline__box">
                                <ul class="timeline__info">
                                    <li class="timeline__info__item timeline__info__calendar">
                                        <img class="timeline__info__icon" src="assets/icons/calendar.svg" alt="">
                                        <p class="timeline__info__desc">${purchase.getDate()}</p>
                                    </li>
                                    <li class="timeline__info__item timeline__info__clock">
                                        <img class="timeline__info__icon" src="assets/icons/clock.svg" alt="">
                                        <p class="timeline__info__desc">${purchase.getHour()}</p>
                                    </li>
                                    <li class="timeline__info__item timeline__info__place">
                                        <img class="timeline__info__icon" src="assets/icons/place.svg" alt="">
                                        <p class="timeline__info__desc">${purchase.location}</p>
                                    </li>
                                    <li class="timeline__info__item timeline__info__money">
                                        <img class="timeline__info__icon" src="assets/icons/money.svg" alt="">
                                        <p class="timeline__info__desc">${formatToReal(purchase.getTotalPrice())}</p>
                                    </li>
                                    
                                </ul>
                                <div class="timeline__products">
                                    <table id="productsList" class="timeline__products__list">
                                         <tr class="timeline__header">
                                            <th width="80%">Produto</th>
                                            <th width="80%">Preço</th>
                                        </tr>
                                        `
                                        purchase.products.forEach(product => {
                                            content = content + 
                                                `
                                                <tr class="timeline__product">
                                                    <td>${product.name}</td>
                                                    <td>${formatToReal(product.price)}</td>
                                                </tr>
                                                `
                                        })

                                        content = content + 
                                        `
                                    </table>
                                </div>
                            </div>`

                    // Criar novo box
                    let listItem = document.createElement('article')
                    listItem.className = "timeline__item"
                    listItem.innerHTML = content
                    eventsList.appendChild(listItem)
                });
            
            } else {
                console.log('Não foi possível recuperar as informações.')
            }
        }
    }

    xhttp.open("GET", "https://storage.googleapis.com/dito-questions/events.json", true)
    xhttp.send()
}

loadData()