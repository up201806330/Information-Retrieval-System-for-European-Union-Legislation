document.getElementById('search-text').addEventListener('keyup', event => {
    if(event.key !== "Enter") return
    facetAndSearch()
})

function facetAndSearch(faceting_form){
    // Resetting default parameters
    q_text = false
    q_page=1
    qf = 'title^5 eurovoc_descriptors^5 subject_matter^5 addressee^2 text celex'
    q_facetFilter = ''

    q_facetQuery = facetQuery(faceting_form)
    runQuery()
}

var q_text = false
var q_page = 1
var qf = 'title^5 eurovoc_descriptors^5 subject_matter^5 addressee^2 text celex'
function runQuery(){
    let text = q_text? q_text:document.getElementById('search-text').value
    let query = "http://localhost:8983/solr/docs/query?" +
        "defType=edismax" + 
        "&qf=" + qf + 
        "&q=" + text +
        q_facetQuery + 
        q_facetFilter +
        "&start=" + (q_page-1)*10
    
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState != 4 || xmlHttp.status != 200) return

        // console.log(query)
        // console.log(xmlHttp.response)

        updatePagination(q_page, xmlHttp.response)
        updateFacetingResults(xmlHttp.response)
        updateBoardData(xmlHttp.response, q_page)
    }
    xmlHttp.responseType = 'json'
    xmlHttp.open( "GET", query, true )
    xmlHttp.send( null )
}

const NUMBER_PAGES_DISPLAY = 10
const RESULTS_PER_PAGE = 10

function updatePagination(page, dataObj){
    let div = document.getElementById('pagination-pages')
    div.innerHTML = ''

    let nPages = Math.ceil(dataObj.response.numFound / RESULTS_PER_PAGE)
    let minPage = Math.max(page-Math.ceil(NUMBER_PAGES_DISPLAY/2), 1)
    let maxPage = Math.min(minPage+NUMBER_PAGES_DISPLAY-1, nPages)
    if(maxPage-minPage+1 < NUMBER_PAGES_DISPLAY){
        minPage = Math.max(1, maxPage - NUMBER_PAGES_DISPLAY + 1)
    }
    for (let i = minPage ; i <= maxPage ; i++){
        let newPage = document.createElement('a')
        newPage.setAttribute('onclick', `q_page=${i}; runQuery();`)
        newPage.innerHTML = `<div>${i}</div>`
        if(i == page) newPage.classList.add('active')
        div.appendChild(newPage)
    }

    l = document.getElementById("arrow-left").classList
    if(page-1 < 1) l.add("hidden"); else l.remove("hidden")

    l = document.getElementById("arrow-right").classList
    if(page+1 > nPages) l.add("hidden"); else l.remove("hidden")
}
