const pageContent = document.getElementById("pageContent")
const homeNav = document.getElementById("homeNav")
const accountsNav = document.getElementById("accountsNav")
const createAccNav = document.getElementById("createAccNav")

let ul = document.createElement("ul")
let h1 = document.createElement("h1")


// ------------------------------------- on pageload --------------------------------------------

homePage()

// ------------------------------------- nav --------------------------------------------

homeNav.addEventListener("click", () => { homePage() })


createAccNav.addEventListener("click", () => { create() })


accountsNav.addEventListener("click", async () => { accounts() })


// ------------------------------------- PAGES ------------------------------------------------

// ------------------------------------- home page --------------------------------------------

function homePage() {
    pageContent.innerHTML = `
    <div class="flex">
    <img src="assets/bankpi.png" class="small" alt="bank">
    <div class="textDiv">
        <h1 class="firstpageHeading">Vad sparar du till?</h1>
        <p>Vi är en pålitlig och modern bank som strävar efter att ge våra kunder en enastående upplevelse. 
        Vi erbjuder skräddarsydda finansiella lösningar för att hjälpa dig att uppnå dina ekonomiska mål. <br><br>
        Oavsett om du vill spara pengar, investera för framtiden eller ta ett lån, kan du lita på oss för 
        att erbjuda de bästa alternativen som passar just dina behov.</p>
    </div>
    </div>`
}


// ------------------------------------- create new account --------------------------------------------

async function create() {
    pageContent.innerHTML = ""
    h1.innerText = "Skapa nytt konto"
    pageContent.append(h1)

    let form = document.createElement("form")
    // form.setAttribute
    form.innerHTML = `
    <label for="accountName">Kontonamn:</label><br>
    <input type="text" id="accountName" name="accountName" required><br>

    <label for="sum">Summa:</label><br>
    <input type="number" id="sum" name="sum" min=0><br>

    `
    let btn = document.createElement("button")
    btn.classList.add("btn")
    btn.innerText = "Skapa konto"
    form.append(btn)
    pageContent.append(form)


    form.addEventListener("submit", (e) => {
        e.preventDefault()
        let accountName = document.getElementById("accountName")
        let sum = document.getElementById("sum")

        createData(accountName.value, sum.value)
        form.reset()
    })
}


// ------------------------------------- account list --------------------------------------------

async function accounts() {
    pageContent.innerHTML = ""

    let data = await getData()

    h1.innerText = "Nuvarande konton"
    pageContent.append(h1)

    pageContent.append(ul)
    ul.innerHTML = ""

    data.forEach(element => {
        let li = document.createElement("li")
        li.innerHTML = `Konto: ${element.accountName}<br>
        Kontonummer: ${element.accountNumber}<br>
        Summa: <span class="sum">${element.sum}</span><br>`

        let btn = document.createElement("button")
        btn.classList.add("btn")
        btn.setAttribute("data-accountid", element._id)
        btn.innerText = "Mer info"

        btn.addEventListener("click", () => {
            account(element._id)
        })

        li.append(btn)
        ul.append(li)
    });
}


// ------------------------------------- single account page --------------------------------------------

async function account(id) {
    pageContent.innerHTML = ""
    h1.innerText = ""
    pageContent.append(h1)

    let data = await getDataById(id)

    let div = document.createElement("div")
    div.classList.add("accountDiv")
    div.innerHTML = `
    <h2>Konto detaljer</h2>
    Konto: ${data.accountName}<br>
    Kontonummer: ${data.accountNumber}<br>
    Summa: <span class="sum">${data.sum}</span><br><br>`

    let formUpdateAcc = document.createElement("form")

    formUpdateAcc.innerHTML = `
    <h2>Sätt in eller ta ut pengar</h2>
    <label for="sumValue">Summa:</label><br>
    <input type="number" id="sumValue" name="sumValue" min=0 required><br>

    <input type="radio" name="updateAcc" id="with" value="plus" required> <label for="with">Sätt in</label><br>
    <input type="radio" name="updateAcc" id="depo" value="minus"> <label for="depo">Ta ut</label><br>
    <p id="errorText"></p>
    <button type="submit" class="btn">Uppdatera konto</button>`


    formUpdateAcc.addEventListener("submit", (e) => {
        e.preventDefault()

        let errorText = document.getElementById("errorText")
        errorText.innerText = ""
        let sumValue = Number(document.getElementById("sumValue").value)
        let checkedOpt = document.querySelector("input[type='radio'][name=updateAcc]:checked")

        if (checkedOpt.value === "minus") {
            if (data.sum >= sumValue) {
                updateAccount(id, sumValue, "withdrawal")
            } else {
                errorText.innerText = "För lite pengar på kontot"
            }
        } else if (checkedOpt.value === "plus"){
            updateAccount(id, sumValue, "deposit")
        }

    })
    

    let deleteBtn = document.createElement("button")
    deleteBtn.classList.add("btn")
    deleteBtn.setAttribute("data-accountid", data._id)
    deleteBtn.innerText = "Ta bort konto"

    deleteBtn.addEventListener("click", async (e) => {
        if (confirm("Är du säker på att du vill ta bort detta konto?")) {
            deleteAccount(deleteBtn.dataset.accountid)
        }
    })

    let backBtn = document.createElement("btn")
    backBtn.classList.add("backBtn")
    backBtn.innerHTML = `<i class="fa-solid fa-arrow-left"></i> Tillbaka`
    backBtn.addEventListener("click", () => {
        accounts()
    })

    pageContent.append(backBtn, div, formUpdateAcc, deleteBtn)
}








// ------------------------------------- fetch --------------------------------------------


async function getData() {
    try {
        const res = await fetch(`http://localhost:3006/accounts`)
        const data = await res.json()
        return data

    } catch (error) {
        console.log("Something went wrong here")
    }
}

async function getDataById(id) {
    try {
        const res = await fetch(`http://localhost:3006/accounts/${id}`)
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Something went wrong")
    }
}

async function createData(accountName, sum) {
    try {
        const res = await fetch(`http://localhost:3006/accounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accountName,
                sum
            })
        })
        return res
    } catch (error) {
        console.log("Something went wrong")
    }
}

async function deleteAccount(id) {
    try {
        await fetch(`http://localhost:3006/accounts/${id}`, {
            method: "DELETE",
        })
            .then(res => {
                if (!res.ok) {
                    alert("Något gick fel")
                } else {
                    accounts()
                }
        })
    } catch (error) {
        console.log("Something went wrong, could not delete data")
    }
}


async function updateAccount(id, sum, action) {
    try {
        await fetch(`http://localhost:3006/accounts/${id}/${action}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sum: sum
            })
        })
            .then(res => {
                if (!res.ok) {
                    alert("Något gick fel")
                } else {
                    account(id)
                }
            })
    } catch (error) {
        console.log("Something went wrong here", error)
    }
}


