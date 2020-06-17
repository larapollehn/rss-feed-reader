const LOCAL_STORAGE_URL_KEY = "FEED_URL";

function defaultUrl() {
    localStorage.setItem(LOCAL_STORAGE_URL_KEY, JSON.stringify(['https://web.de/feeds/rss/magazine/news/index.rss', 'https://www.buzzfeed.com/de/wtf.xml', 'https://techcommunity.microsoft.com/gxcuf89792/rss/Category?category.id=ITOpsTalk&interaction.style=forum']));
}

let articles = [];

function getFeeds() {
    let feedUrls = JSON.parse(localStorage.getItem(LOCAL_STORAGE_URL_KEY));
    if (feedUrls) {
        for (let i = 0; i < feedUrls.length; i++) {
            let currentUrl = feedUrls[i];
            console.log(currentUrl, i);
            axios({
                method: 'POST',
                url: '/api',
                data: {
                    target: currentUrl
                }
            }).then((response) => {
                let jsonData = xml2js(response.data, {compact: true, spaces: 4});
                let items = jsonData['rss']['channel']['item'];
                articles.push(items);
            }).catch((error) => {
                console.log('Failure, Server Response', error.message);
            });
        }
    }
}

function printArticles() {
    articles.forEach( feed => {
        for (let i = 0; i < feed.length; i++){
            let title = articles[i]['title'];
            let description = articles[i]['description'];
            let pubDate = articles[i]['pubDate'];
            let link = articles[i]['link']
            for(let j = 0; j < articles.length; j++){

            }
        }
    })

}

defaultUrl();
getFeeds();


/**
 let feedItems = [];

 feedItems.forEach(feed => {
    let card = document.createElement('div');
    card.classList.add('card');

    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    let cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title')
    cardTitle.innerText = 'This is a Card Title'

    let cardText = document.createElement('p');
    cardText.classList.add('card-text');
    cardText.innerText = "fdskjflak fldjfl jdslf sfdlkj lfjsdkfj biadofueoij nfljvlasjfkh fljadslk kgjdh fl lfhdfvhljk  hdakvjhalfjlsajd khdfljakvjkjadhv ljdahghaldsjfdfgljfffjf kfj lkj lk fj f kjda lkjd fl fjfkj gldlk fgk d g";

    let pubDate = document.createElement('p');
    pubDate.classList.add('card-text');
    let mutedText = document.createElement('small');
    mutedText.classList.add('text-muted');
    mutedText.innerText = 'published 3min ago';
    pubDate.appendChild(mutedText);

    let link = document.createElement('a');
    link.href = '#';
    link.innerText = 'Read full article';

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    cardBody.appendChild(pubDate);
    cardBody.appendChild(link);

    card.appendChild(cardBody);

    document.getElementById('articles').appendChild(card);
})
 **/