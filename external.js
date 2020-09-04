if (window.self !== window.top) {

    const env = "dev";
    if (window.addEventListener) {
        const $klyndScript = {
            points: [],
            settings: {
                mode: 'normal',
                commentCount: 0,
                url: "*",
                width: null,
                height: null,
                cursorWidth: 50,
                cursorHeight: 50
            },

            init: () => {
                $klyndScript.width = window.innerWidth;
                $klyndScript.height = window.innerHeight;
                $klyndScript.addStyle(env == "dev" ? "http://localhost/php-proxy/external.css" : "https://proxy.klynd.com/external.css");
                $klyndScript.attechEvent();
            },

            attechEvent: () => {
                if (document.readyState !== 'loading') {
                    const details = {
                        type: 'ready',
                        title: document.title,
                        url: document.location.href,
                        height: document.body.clientHeight,
                    }
                    console.log(details);
                    window.top.postMessage(details, $klyndScript.settings.url);
                } else {
                    document.addEventListener("DOMContentLoaded", function (event) {
                        const details = {
                            type: 'ready',
                            title: document.title,
                            url: document.location.href,
                            height: document.body.clientHeight,
                        }
                        console.log(details);
                        window.top.postMessage(details, $klyndScript.settings.url);
                    });
                }

                window.addEventListener("scroll", function (event) {
                    if ($klyndScript.settings.mode == 'comment') {
                        const details = {
                            type: 'mouseScroll',
                            x: window.scrollX,
                            y: window.scrollY
                        }
                        window.top.postMessage(details, $klyndScript.settings.url);
                    }
                });
                window.addEventListener("unload", function (event) {
                    const details = {
                        type: 'unload',
                    }
                    window.top.postMessage(details, $klyndScript.settings.url);
                });
                window.addEventListener("resize", function (event) {
                    $klyndScript.arrangePoints();
                });

                window.addEventListener("mousemove", function (event) {
                    if (!event.target.classList.contains('kl-high-light')) {
                        const elements = document.getElementsByClassName('kl-high-light');
                        while (elements.length > 0) {
                            elements[0].classList.remove('kl-high-light');
                        }
                        event.target.classList.add("kl-high-light");
                    }
                });


                window.addEventListener("mouseout", function (event) {
                    if ($klyndScript.settings.mode == 'comment') {
                        // document.getElementById("klCursor").style.display = 'none';
                    }
                });


                window.addEventListener("message", function (event) {
                    console.log(event);
                    switch (event.data.type) {
                        case 'KlSelectLocator': {
                            if (event.data.points) {
                                $klyndScript.points = event.data.points;
                                $klyndScript.arrangePoints();
                            }
                            break;
                        }
                        case 'settings': {
                            settings = event.data;
                            break;
                        }
                        case "klModeChange": {
                            if (event.data.mode) {
                                $klyndScript.settings.mode = "comment";
                            } else {
                                $klyndScript.settings.mode = "normal";
                            }
                            break;
                        }
                    }
                });


                document.addEventListener('click', function (event) {
                    if ($klyndScript.settings.mode == 'comment') {
                        $klyndScript.processClick(event);
                        event.preventDefault();
                        event.stopPropagation();
                    }
                });

                const klCommentHolder = document.getElementById("#klCommentHolder");
                if (klCommentHolder) {
                    klCommentHolder.addEventListener('mousemove', function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    });
                }
            },

            processClick: ($event) => {
                if (event.target.classList.contains('kl-comment-wrapper')) {

                } else {
                    let elem = document.getElementsByClassName("kl-high-light")[0];
                    if (!elem) {
                        elem = $event.target;
                    }
                    const selectorArr = [];
                    selectorArr.push($klyndScript.getFallbackSelector(elem));
                    selectorArr.push($klyndScript.getFirstSelector(elem));
                    selectorArr.push($klyndScript.getSecondSelector(elem));
                    let position = { top: elem.offsetTop, left: elem.offsetLeft };
                    $klyndScript.settings.commentCount++;
                    const data = {
                        // for local field. 
                        width: $klyndScript.width,
                        height: $klyndScript.height,
                        relativeX: ($event.pageX - position.left) - ($klyndScript.settings.cursorWidth / 2),
                        relativeY: ($event.pageY - position.top) - ($klyndScript.settings.cursorHeight / 2),
                        pageX: $event.pageX - ($klyndScript.settings.cursorWidth / 2),
                        pageY: $event.pageY - ($klyndScript.settings.cursorHeight / 2),
                        clientX: $event.clientX - ($klyndScript.settings.cursorWidth / 2),
                        clientY: $event.clientY - ($klyndScript.settings.cursorHeight / 2),
                        selector: selectorArr,
                        commentCount: $klyndScript.settings.commentCount,
                        url: document.location.href
                    };
                    if (!elem.classList.contains('kl-cursor-elem')) {
                        $klyndScript.addComment(data);
                        console.log($event);
                    }
                }
            },
            addComment: (data) => {
                data.type = 'addComment';
                window.top.postMessage(data, $klyndScript.settings.url);
                //window.postMessage(data, $klyndScript.settings.url);
            },
            addScript: (url, callback) => {
                var script = document.createElement('script');
                script.type = "text/javascript";
                script.src = url;
                document.getElementsByTagName('head')[0].appendChild(script);
                script.onload = callback;
            },
            addStyle: (url) => {
                var script = document.createElement('script');
                script.rel = "stylesheet";
                script.href = url;
                document.getElementsByTagName('head')[0].appendChild(script);
            },

            addCursor: () => {
                const div = document.createElement("div");
                div.setAttribute("id", "klCommentHolder");                       // Create a <p> node
                div.setAttribute("class", "kl-cursor-elem");                       // Create a <p> node                
            },

            getFirstSelector: function (ref) {
                var rightArrowParents = [];
                const parents = $klyndScript.parents(ref);
                for (let i = 0; i < parents.length; i++) {
                    const elem = parents[i];
                    var entry = elem.tagName.toLowerCase();
                    let className = elem.className?elem.className.trim():'';                    
                    if (className) {
                        if (className.baseVal || className.baseVal == '') {
                            return;
                        }
                        if (className.indexOf('kl-high-light') > -1) {
                            const classes = className.replace('kl-high-light', '').trim();
                            if (classes) {
                                entry += "." + classes.replace(/ /g, '.');
                            }
                        } else {
                            entry += "." + className.replace(/ /g, '.');
                        }
                    }
                    rightArrowParents.push(entry);
                }
                let selector = rightArrowParents.join(" ");
                return selector;
            },
            getSecondSelector: function (el) {
                var names = [];
                while (el.parentNode) {
                    if (el.id) {
                        names.unshift('#' + el.id);
                        break;
                    } else {
                        if (el === el.ownerDocument.documentElement || el === el.ownerDocument.body) {
                            names.unshift(el.tagName);
                        } else {
                            for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++) { }
                            names.unshift(el.tagName + ':nth-child(' + c + ')');
                        }
                        el = el.parentNode;
                    }
                }
                return names.join(' > ');
            },
            getFallbackSelector: (ref, limit = 3) => {
                var rightArrowParents = [];
                const parents = $klyndScript.parents(ref);
                let count = 0;
                for (let i = parents.length; i > 0; i--) {
                    if (count >= limit) {
                        break;
                    }
                    const elem = parents[i - 1];
                    let entry = elem.tagName.toLowerCase();
                    let className = elem.className?elem.className.trim():'';
                    if (className) {
                        if (className.baseVal || className.baseVal == '') {
                            return;
                        }
                        className = className.split(" ")[0];
                        if (className != 'kl-high-light') {
                            entry += "." + className;
                            count++;
                        }
                    }
                    if (elem.id) {
                        entry += "#" + elem.id;
                        rightArrowParents.push(entry);
                        break;
                    }
                    rightArrowParents.push(entry);
                }
                let selector = rightArrowParents.reverse().join(" > ");
                if (document.querySelector(selector)) {
                    rightArrowParents = [];
                    let lastId, lastClass;
                    for (let i = parents.length; i > 0; i--) {
                        const elem = parents[i - 1];
                        let entry = elem.tagName.toLowerCase();
                        let className = elem.className?elem.className.trim():'';
                        if (className) {
                            if (className.baseVal || className.baseVal == '') {
                                return;
                            }
                            className = className.split(" ")[0];
                            if (!lastClass) {
                                lastClass = "." + className + rightArrowParents.reverse().join(" > ");
                            }
                            if (className != 'kl-high-light') {
                                entry += "." + className;
                                count++;
                            }
                        }
                        if (elem.id) {
                            entry += "#" + elem.id;
                            rightArrowParents.push(entry);
                            lastId = elem.id;
                            break;
                        }
                        rightArrowParents.push(entry);
                    }
                    let newSelector = rightArrowParents.reverse().join(" > ");
                    if (lastId) {
                        selector = '#' + lastId + ' ' + (lastClass ? lastClass : '');
                    }
                    parent = ref.parentNode;
                    const index = Array.prototype.indexOf.call(parent.children, ref) + 1;
                    selector += ':nth-child(' + index + ')';
                }
                return selector;
            },
            arrangePoints: () => {
                const points = $klyndScript.points;
                for (const property in points) {
                    const point = points[property];
                    for (let i = 0; i < point.selector.length; i++) {
                        //let elem = jQuery(point.selector[i]);
                        let elem = document.querySelectorAll(point.selector[i]);
                        if (elem && elem.length == 1) {
                            elem = elem[0];
                            point.x = parseFloat(point.relativeX) + elem.offsetLeft;
                            point.y = parseFloat(point.relativeY) + elem.offsetTop;
                            break;
                        } else {
                            if (i == (point.selector.length - 1)) {
                                if (elem) {
                                    elem = elem[0];
                                } else if (i > 0) {
                                    elem = document.querySelectorAll(point.selector[i - 1])[0];
                                    if (elem.length > 0) {
                                        elem = elem[0];
                                    }
                                }
                                if (elem) {
                                    point.x = parseFloat(point.relativeX) + elem.offsetLeft;
                                    point.y = parseFloat(point.relativeY) + elem.offsetTop;
                                }
                            }
                        }
                    }
                }
                window.top.postMessage({
                    type: 'rearrangeNodes',
                    nodes: points
                },
                    $klyndScript.settings.url
                );
            },
            parents: function (node) {
                let current = node,
                    list = [node];
                while (current.parentNode != null && current.parentNode != document.documentElement) {
                    list.push(current.parentNode);
                    current = current.parentNode;
                }
                return list.reverse();
            },
            getPosition(element) {
                var rec = element.getBoundingClientRect();
                console.log(rec.top, element.offsetLeft, rec.left, element.offsetTop);
                return { top: rec.top + window.scrollY, left: rec.left + window.scrollX };
            }
        }
        $klyndScript.init();
    }
}
