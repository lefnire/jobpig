import _ from 'lodash';
let books = {
  //jsGoodParts: {
  //  href: "//www.amazon.com/gp/product/0596517742/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0596517742&linkCode=as2&tag=ha0d2-20&linkId=OFKJRPMME7IVQ2HQ",
  //  img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=0596517742&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
  //  img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=0596517742"
  //  // FIXME who?
  //},
  remote: {
    href:"//www.amazon.com/gp/product/0804137501/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0804137501&linkCode=as2&tag=ha0d2-20&linkId=DFCJ36ZLNWLTAPUG",
    img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=0804137501&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
    img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=0804137501",
    target: 'remote'
  },
  webDesign: {
    href: "//www.amazon.com/gp/product/1118907442/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1118907442&linkCode=as2&tag=ha0d2-20&linkId=D33VUOUZ267FJUGI",
    img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1118907442&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
    img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=1118907442",
    target: 'html css design'
  },
  proReact: {
    href: "//www.amazon.com/gp/product/1484212614/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1484212614&linkCode=as2&tag=ha0d2-20&linkId=EKNABP3YKMPGS3LT",
    img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1484212614&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
    img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=1484212614",
    target: 'react reactjs angular angularjs javascript node nodejs'
  },
  reactNative: {
    href:"//www.amazon.com/gp/product/1491929006/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1491929006&linkCode=as2&tag=ha0d2-20&linkId=2AVQVKV5DE6KC6H2",
    img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1491929006&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
    img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=1491929006",
    target: 'ios swift android objective-c react_native reactnative react reactjs'
  },
  pythonML: {
    href: "//www.amazon.com/gp/product/1783555130/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1783555130&linkCode=as2&tag=ha0d2-20&linkId=HMINRPD3CNBL4D2O",
    img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1783555130&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
    img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=1783555130",
    target: 'python machine_learning machinelearning'
  },
  scala: {
    href:"//www.amazon.com/gp/product/1449367933/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1449367933&linkCode=as2&tag=ha0d2-20&linkId=QEZE5SJBTLUTUXOD",
    img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1449367933&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
    img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=1449367933",
    target: 'java spark'
  },
  spark: {
    href: "//www.amazon.com/gp/product/1449358624/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1449358624&linkCode=as2&tag=ha0d2-20&linkId=AVM3TSWYPPE5NEFF",
    img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1449358624&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
    img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=1449358624",
    target: 'python scala data_science machine_learning machinelearning'
  },
  //python: {
  //  href: '//www.amazon.com/gp/product/1449355730/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1449355730&linkCode=as2&tag=ha0d2-20&linkId=YYGECQFZ6ADBHY7F',
  //  img1: '//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1449355730&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20',
  //  img2: '//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=1449355730',
  //},
  //sql: {
  //  href:"//www.amazon.com/gp/product/0596520832/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0596520832&linkCode=as2&tag=ha0d2-20&linkId=VAE3KNSCAZJU4VGO",
  //  img1:"//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=0596520832&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
  //  img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=0596520832",
  //  target: 'postgres mysql sqlserver'
  //},
  //java: {
  //  href:"//www.amazon.com/gp/product/0071809252/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0071809252&linkCode=as2&tag=ha0d2-20&linkId=BL6445RXSG4JTWOJ",
  //  img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=0071809252&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
  //  img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=0071809252",
  //  target: 'spring hybernate'
  //},
  postgres: {
    href: "//www.amazon.com/gp/product/1449373194/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1449373194&linkCode=as2&tag=ha0d2-20&linkId=QWMNC2P7KUWX646H",
    img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1449373194&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
    img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=1449373194",
    target: 'mysql sql postgres'
  },
  xamarin: {
    href:"//www.amazon.com/gp/product/1484202155/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1484202155&linkCode=as2&tag=ha0d2-20&linkId=WEUXHL5GIJTUKFTB",
    img1: "//ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=1484202155&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=ha0d2-20",
    img2: "//ir-na.amazon-adsystem.com/e/ir?t=ha0d2-20&l=as2&o=1&a=1484202155",
    target: 'xamarin c# .net'
  }
  //php: {},
  //ruby: {}
  //'c++': {},
};

let ads = [];
_.each(books, book => {
  book.target.split(' ').forEach(t => {
    if (!ads[t]) ads[t] = [];
    ads[t].push(book);
  });
});

export default ads;