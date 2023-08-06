const WIDTH = 200;
const HEIGHT = 100;
const IGNORE_ELEMENT = [
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'P',
    'SPAN',
    'A',
    'IMG',
    'BUTTON',
    'INPUT',
    'SELECT',
    'TEXTAREA',
    'LABEL',
]
const DEBUG = true;

function captureElement(elem) {
    const elems = [];
    if (elem.children.length > 0) {
        if (isAllChildElementSmallerThanSize(elem, { width: WIDTH, height: HEIGHT })) {
            // All children are smaller than 200x200, so we can choose this element as a copmponent.
            if (DEBUG) {
                console.log(`target element's children are all smaller than ${WIDTH}x${HEIGHT}`);
                console.log(elem.tagName, elem.children.length);
            }
            elems.push(getQuerySelector(elem));
        } else {
            if (DEBUG) {
                console.log(`target element's children are not all smaller than ${WIDTH}x${HEIGHT}`);
                console.log(elem.tagName, elem.children.length);
                console.log(elem.innerHTML);
            }
            const childElems = [];
            for (const child of elem.children) {
                childElems.push(...captureElement(child));
            }
            if (DEBUG) {
                console.log('childElems of ', elem.tagName, elem.children.length);
                console.log(childElems);
            }
            if (childElems.length > 0)
                elems.push(...childElems);
            else if (!IGNORE_ELEMENT.includes(elem.tagName))
                elems.push(getQuerySelector(elem));
        }
    } else {
        const { width, height } = getElementSize(elem);
        if ((width > WIDTH && height > HEIGHT) && !IGNORE_ELEMENT.includes(elem.tagName)) {
            elems.push(getQuerySelector(elem));
        }
    }

    return elems;
}

function getElementSize(elem) {
    const { width, height } = elem.getBoundingClientRect();
    return { width, height };
}

function isAllChildElementSmallerThanSize(elem, size) {
    if (elem.children.length === 0) return true;

    for (const child of elem.children) {
        const { width, height } = getElementSize(child);
        if (height === 0) continue;
        console.log(`width: ${width} height: ${height} ${child.tagName}`);
        if ((width > WIDTH && height > HEIGHT) && !IGNORE_ELEMENT.includes(elem.tagName)) {
            return false;
        }
    }

    return true;
}

function getQuerySelector(elem) {
    let element = elem;
    let str = "";
    function loop(element) {
      // stop here = element has ID
      if(element.getAttribute("id")) {
        str = str.replace(/^/, " #" + element.getAttribute("id"));
        str = str.replace(/\s/, "");
        str = str.replace(/\s/g, " > ");
        return str;
      }
  
      // stop here = element is body
      if(document.body === element) {
        str = str.replace(/^/, " body");
        str = str.replace(/\s/, "");
        str = str.replace(/\s/g, " > ");
        return str;
      }
  
      // concat all classes in "queryselector" style
      if(element.getAttribute("class")) {
        let elemClasses = ".";
        elemClasses += element.getAttribute("class");
        elemClasses = elemClasses.replace(/\s/g, ".");
        elemClasses = elemClasses.replace(/^/g, " ");
        let classNth = "";
  
        // check if element class is the unique child
        const childrens = element.parentNode.children;
  
        if(childrens.length < 2) {
          return;
        }

        const similarClasses = [];
        for(var i = 0; i < childrens.length; i++) {
          if(element.getAttribute("class") ==  childrens[i].getAttribute("class")) {
            similarClasses.push(childrens[i]);
          }
        }

        if(similarClasses.length > 1) {
          for(var j = 0; j < similarClasses.length; j++) {
            if(element === similarClasses[j]) {
              j++;
              classNth = ":nth-of-type(" + j + ")";
              break;
            }
          }
        }
        str = str.replace(/^/, elemClasses + classNth);
      } else {
        // get nodeType
        const name = element.nodeName.toLowerCase();
        let nodeNth = "";
        const childrens = element.parentNode.children;

        if(childrens.length > 2) {
          var similarNodes = [];
          for(var i = 0; i < childrens.length; i++) {
            if(element.nodeName == childrens[i].nodeName) {
              similarNodes.push(childrens[i]);
            }
          }
          if(similarNodes.length > 1) {
            for(var j = 0; j < similarNodes.length; j++) {
              if(element === similarNodes[j]) {
                j++;
                nodeNth = ":nth-of-type(" + j + ")";
                break;
              }
            }
          }
  
        }
        str = str.replace(/^/, " " + name + nodeNth);
      }
  
      if(element.parentNode) {
        loop(element.parentNode);
      } else {
        str = str.replace(/\s/g, " > ");
        str = str.replace(/\s/, "");
        return str;
      }
    }
    loop(element);
    return str;
}
  