const LOCAL_STORAGE_URL_KEY = "FEED_URL";

/**
 * State manager for managing all kind of stuff. Generic implementation
 *
 * @param insertCallback what should happen when a new insertion happens
 * @param deleteCallback what should happen when an item is deleted from the state
 */
function StateManager(insertCallback, deleteCallback) {
    const obj = {};
    obj.state = [];
    obj.stateSet = new Set();
    obj.insertCallback = insertCallback;
    obj.deleteCallback = deleteCallback;

    obj.append = function (element) {
        if (!obj.stateSet.has(element)) {
            obj.state.push(element);
            obj.stateSet.add(element);
            if(obj.insertCallback){
                obj.insertCallback(element);
            }
        }
    }

    obj.delete = function (item) {
        if (obj.stateSet.has(item)) {
            obj.stateSet.delete(item);
            obj.state = obj.state.filter(function (i) {
                return i !== item;
            });
            if(obj.deleteCallback) {
                obj.deleteCallback(item);
            }
        }
    }
    return obj;
}

/**
 * Global State manager for each URL's feed.
 */
const feedState = StateManager(renderFeed, null);

/**
 * Global State manager
 */
const urlState = StateManager(getFeedOfUrl, null);

/**
 * Fetch every URL from the LocalStarage and push it into the url state
 */
function getUrls() {
    let feedUrls = JSON.parse(localStorage.getItem(LOCAL_STORAGE_URL_KEY));
    if (feedUrls) {
        for (let i = 0; i < feedUrls.length; i++) {
            let currentUrl = feedUrls[i];
            urlState.append(currentUrl);
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
        let jsonData = xml2js(response.data, {compact: true, spaces: 4});
        let items = jsonData['rss']['channel']['item'];
        feedState.append(items);
    }).catch((error) => {
        console.log('Failure, Server Response', error.message);
    });
}

/**
 * Callback function after the feed of an URL is fetched.
 * This callback function will render each article of the feed.
 *
 * @param articles a collection of a feed. Composed of many articles
 */
function renderFeed(articles) {
    for (let i = 0; i < articles.length; i++) {
        let titleText = articles[i]['title']["_text"];
        let descriptionText = articles[i]['description']["_text"];
        let pubDateText = articles[i]['pubDate']["_text"];
        let linkText = articles[i]['link']["_text"];
        console.log(linkText);

        let card = document.createElement('div');
        card.classList.add('card');

        let cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        let cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title')
        cardTitle.innerText = titleText;

        let cardText = document.createElement('p');
        cardText.classList.add('card-text');
        cardText.innerText = descriptionText;

        let pubDate = document.createElement('p');
        pubDate.classList.add('card-text');
        let mutedText = document.createElement('small');
        mutedText.classList.add('text-muted');
        mutedText.innerText = pubDateText;
        pubDate.appendChild(mutedText);

        let link = document.createElement('a');
        link.href = linkText;
        link.innerText = 'Read full article';

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        cardBody.appendChild(pubDate);
        cardBody.appendChild(link);

        card.appendChild(cardBody);

        document.getElementById('articles').appendChild(card);
    }
}

function main() {
    getUrls();
}

main();