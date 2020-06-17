const LOCAL_STORAGE_URL_KEY = "FEED_URL";
const BAD_LOCAL_STORAGE_URL_KEY = "BAD_FEED_URL";

/**
 * Add a new URL to fetch feed from to localStorage
 */
function addNewUrlToLocalStorage() {
    let url = document.getElementById('newUrl').value;
    let feeds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_URL_KEY));
    if (!feeds.includes(url)) {
        feeds.push(url);
    }
    localStorage.setItem(LOCAL_STORAGE_URL_KEY, JSON.stringify(feeds));
    if(feeds.length !== 0){
        document.getElementById("empty").style.display = "none";
    }else{
        document.getElementById("empty").style.display = "block";
    }
    getFeedOfUrl(url);
    renderFeedList();
}

/**
 * Remove an URL from the list of sources to fetch feed
 * @param url the url to remove
 */
function removeAnUrlFromLocalStorage(url) {
    let allFeeds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_URL_KEY)) || [];
    allFeeds = allFeeds.filter(current => current !== url);

    let badFeeds = JSON.parse(localStorage.getItem(BAD_LOCAL_STORAGE_URL_KEY)) || [];
    badFeeds = badFeeds.filter(current => current !== url);

    localStorage.setItem(LOCAL_STORAGE_URL_KEY, JSON.stringify(allFeeds));
    localStorage.setItem(BAD_LOCAL_STORAGE_URL_KEY, JSON.stringify(badFeeds));

    const articlesOfRemovedFeed = Array.from(document.getElementsByClassName(url));
    articlesOfRemovedFeed.forEach(article => {
        document.getElementById('articles').removeChild(article);
    });
    if(allFeeds.length !== 0){
        document.getElementById("empty").style.display = "none";
    }else{
        document.getElementById("empty").style.display = "block";
    }
}

/**
 * Render the sources of every list in the right top corner of the page
 */
function renderFeedList() {
    let allFeeds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_URL_KEY)) || [];
    let badFeeds = JSON.parse(localStorage.getItem(BAD_LOCAL_STORAGE_URL_KEY)) || [];
    let menu = document.getElementById('urlMenu');
    while (menu.hasChildNodes()) {
        menu.removeChild(menu.firstChild);
    }

    function render(originalItem) {
        let item = originalItem.length > 20 ? originalItem.substr(0, 50) + "... " : originalItem;
        let div = document.createElement("div");
        div.id = `div-${originalItem}`;

        let p = document.createElement('p');
        p.classList.add('dropdown-item');
        p.id = originalItem;

        let close = document.createElement("button");
        let closeDiv = document.createElement("div");
        close.type = "button";
        close.classList.add("close");
        close.id = `close-${originalItem}`
        close.setAttribute("aria-label", "Close");
        let span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        span.innerHTML = "&times;";
        close.appendChild(span);
        closeDiv.appendChild(close);
        p.innerHTML = closeDiv.innerHTML + item;

        div.appendChild(p);
        menu.appendChild(div);
        document.getElementById(`close-${originalItem}`).addEventListener("click", function () {
            div.parentNode.removeChild(div);
            removeAnUrlFromLocalStorage(originalItem);
        })
    }

    for (let i = 0; i < allFeeds.length; i++) {
        if (!badFeeds.includes(allFeeds[i])) {
            render(allFeeds[i]);
        }
    }
    for (let i = 0; i < badFeeds.length; i++) {
        render(badFeeds[i]);
    }
}

/**
 * Add url which can not be read and parsed into localStorage. Those urls should
 * be marked as such.
 *
 * @param url bad url
 */
function addBadUrlToLocalStorage(url) {
    let badUrls = localStorage.getItem(BAD_LOCAL_STORAGE_URL_KEY);
    if (badUrls) {
        badUrls = JSON.parse(badUrls);
        if (!badUrls.includes(url)) {
            badUrls.push(url);
        }
    } else {
        badUrls = [url];
    }
    localStorage.setItem(BAD_LOCAL_STORAGE_URL_KEY, JSON.stringify(badUrls));
}

/**
 * Fetch every URL from the LocalStarage and push it into the url state
 */
function getUrlsFromLocalStorage() {
    let feedUrls = JSON.parse(localStorage.getItem(LOCAL_STORAGE_URL_KEY));
    if (feedUrls) {
        if(feedUrls.length > 0) {
            document.getElementById("empty").style.display = "none";
            for (let i = 0; i < feedUrls.length; i++) {
                let currentUrl = feedUrls[i];
                getFeedOfUrl(currentUrl);
            }
        }else{
            document.getElementById("empty").style.display = "block";
        }
    }
}

/**
 * Asynchronous function for fetching feed of each URL.
 * The result of each URL will be pushed into the state
 */
function getFeedOfUrl(url) {
    axios({
        method: 'POST',
        url: '/api',
        data: {
            target: url
        }
    }).then((response) => {
        try {
            let jsonData = xml2js(response.data, {compact: true, spaces: 4});
            let items = jsonData['rss']['channel']['item'];
            renderFeed(items, url);
        } catch (e) {
            addBadUrlToLocalStorage(url);
        }
    }).catch((error) => {
        console.log('Failure, Server Response: ', error.response);
        addBadUrlToLocalStorage(url);
    });
}

/**
 * Callback function after the feed of an URL is fetched.
 * This callback function will render each article of the feed.
 *
 * @param articles a collection of a feed. Composed of many articles
 * @param url from which URL this feeds come from
 */
function renderFeed(articles, url) {
    /**
     * Remove html tag from the string
     * @param html string with possible html tags
     * @returns {string} string without html tags
     */
    function stripHtml(html) {
        if (html) {
            html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
            html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
            html = html.replace(/<\/div>/ig, '\n');
            html = html.replace(/<\/li>/ig, '\n');
            html = html.replace(/<li>/ig, '  *  ');
            html = html.replace(/<\/ul>/ig, '\n');
            html = html.replace(/<\/p>/ig, '\n');
            html = html.replace(/<br\s*[\/]?>/gi, "\n");
            html = html.replace(/<[^>]+>/ig, '');
            html = html.replace(/&[a-zA-Z]+;/ig, '.');
            html = html.replace(/[\r\n]{2,}/g, "\n");
            html = html.split("\n").filter(function (e) {
                return e.length > 1;
            }).join("\n");
            return html;
        }
    }

    /**
     * Function to extract the domain of an URL
     *
     * @param data the URL in form of http://subdomain.domain.firsttld.secondtld/john/doe
     * @returns {*} the domain subdomain.domain.firsttld.secondtld
     */
    function extractDomain(data) {
        const a = document.createElement('a');
        a.href = data;
        const hostname = a.hostname;

        /**
         * Remove the sub domain from the url
         *
         * @param s domain in form of http: subdomain.domain.firsttld.secondtld
         * @returns {string} the desired domain domain.firsttld.secondtld
         */
        function removeSubdomain(s) {
            const firstTLDs = "ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|be|bf|bg|bh|bi|bj|bm|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|cl|cm|cn|co|cr|cu|cv|cw|cx|cz|de|dj|dk|dm|do|dz|ec|ee|eg|es|et|eu|fi|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|im|in|io|iq|ir|is|it|je|jo|jp|kg|ki|km|kn|kp|kr|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|na|nc|ne|nf|ng|nl|no|nr|nu|nz|om|pa|pe|pf|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|yt".split('|');
            const secondTLDs = "com|edu|gov|net|mil|org|nom|sch|caa|res|off|gob|int|tur|ip6|uri|urn|asn|act|nsw|qld|tas|vic|pro|biz|adm|adv|agr|arq|art|ato|bio|bmd|cim|cng|cnt|ecn|eco|emp|eng|esp|etc|eti|far|fnd|fot|fst|g12|ggf|imb|ind|inf|jor|jus|leg|lel|mat|med|mus|not|ntr|odo|ppg|psc|psi|qsl|rec|slg|srv|teo|tmp|trd|vet|zlg|web|ltd|sld|pol|fin|k12|lib|pri|aip|fie|eun|sci|prd|cci|pvt|mod|idv|rel|sex|gen|nic|abr|bas|cal|cam|emr|fvg|laz|lig|lom|mar|mol|pmn|pug|sar|sic|taa|tos|umb|vao|vda|ven|mie|北海道|和歌山|神奈川|鹿児島|ass|rep|tra|per|ngo|soc|grp|plc|its|air|and|bus|can|ddr|jfk|mad|nrw|nyc|ski|spy|tcm|ulm|usa|war|fhs|vgs|dep|eid|fet|fla|flå|gol|hof|hol|sel|vik|cri|iwi|ing|abo|fam|gok|gon|gop|gos|aid|atm|gsm|sos|elk|waw|est|aca|bar|cpa|jur|law|sec|plo|www|bir|cbg|jar|khv|msk|nov|nsk|ptz|rnd|spb|stv|tom|tsk|udm|vrn|cmw|kms|nkz|snz|pub|fhv|red|ens|nat|rns|rnu|bbs|tel|bel|kep|nhs|dni|fed|isa|nsn|gub|e12|tec|орг|обр|упр|alt|nis|jpn|mex|ath|iki|nid|gda|inc".split('|');
            s = s.replace(/^www\./, '');
            let parts = s.split('.');
            while (parts.length > 3) {
                parts.shift();
            }
            if (parts.length === 3 && ((parts[1].length > 2 && parts[2].length > 2) || (secondTLDs.indexOf(parts[1]) === -1) && firstTLDs.indexOf(parts[2]) === -1)) {
                parts.shift();
            }
            return parts.join('.');
        }

        return (removeSubdomain(hostname));
    }

    try {
        for (let i = 0; i < articles.length; i++) {
            let titleText = articles[i]['title']["_text"] || articles[i]['title']["_cdata"];
            let descriptionText = stripHtml(articles[i]['description']["_text"]) || stripHtml(articles[i]['description']["_cdata"]);
            let pubDateText = articles[i]['pubDate']["_text"] || articles[i]['pubDate']["_cdata"];
            let linkText = articles[i]['link']["_text"] || articles[i]['link']["_cdata"];
            let card = document.createElement('div');
            card.classList.add('card');
            card.classList.add('flex-row');
            card.classList.add('flex_wrap');

            let cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            let cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardTitle.style.fontWeight = "bold";
            cardTitle.innerText = titleText;

            let cardText = document.createElement('p');
            cardText.classList.add('card-text');
            cardText.style.color = "#505050";
            cardText.innerText = descriptionText;

            let pubDate = document.createElement('p');
            pubDate.classList.add('card-text');
            pubDate.classList.add("pub-date");
            let mutedText = document.createElement('small');
            mutedText.classList.add('text-muted');
            mutedText.innerText = pubDateText;
            pubDate.appendChild(mutedText);

            let link = document.createElement('a');
            link.href = linkText;
            link.target = "_blank";
            link.innerText = `Read full article at ${extractDomain(url)}`;

            cardBody.appendChild(cardTitle);
            cardBody.appendChild(cardText);
            cardBody.appendChild(pubDate);
            cardBody.appendChild(link);
            card.classList.add(url);

            /*
             * Some feed does not include image. So we can safely skip the articles from those feeds.
             */
            try {
                let imageText = articles[i]["media:thumbnail"] ? articles[i]["media:thumbnail"]["_attributes"]["url"] : articles[i]["enclosure"]["_attributes"]["url"];
                let imageCard = document.createElement("img");
                imageCard.setAttribute("src", imageText);
                imageCard.style.width = "300px";
                imageCard.style.height = "auto";
                imageCard.classList.add("card-img-top");
                card.appendChild(imageCard);
            } catch (e) {
            }

            card.appendChild(cardBody);
            document.getElementById('articles').appendChild(card);
        }
        sortArticlesByDate();
    } catch (e) {
        console.log(e);
        addBadUrlToLocalStorage(url);
    }
}

/**
 * Sorting articles by date.
 *
 * This function should be called after a new feed is inserted into the DOM.
 *
 * Still very slow, if 100 feeds are inserted sequentially, the DOM will have to
 * be sorted 100 times.
 */
function sortArticlesByDate() {
    let list = document.getElementById('articles');
    let items = list.childNodes;
    let itemsArr = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].nodeType === 1) {
            itemsArr.push(items[i]);
        }
    }
    itemsArr.sort(function (a, b) {
        const aChildren = a.getElementsByClassName("pub-date");
        const bCHildren = b.getElementsByClassName("pub-date");
        if (aChildren && bCHildren && aChildren.length > 0 && bCHildren.length > 0) {
            const aPubDate = aChildren[0].innerText;
            const bPubDate = b.children[1].innerText;
            return aPubDate === bPubDate ? 0 : (aPubDate > bPubDate ? 1 : -1);
        }

    });
    for (let i = 0; i < itemsArr.length; ++i) {
        list.appendChild(itemsArr[i]);
    }
}

function main() {
    getUrlsFromLocalStorage();
    renderFeedList();
}

main();