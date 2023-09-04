const SEARCHABLE_ELEMENTS = [
   'A',
// 'FOOTER',
    'FORM',
// 'HEADER',
    'INPUT',
    'SELECT',
    'TEXTAREA',
    'UL',
    'OL',
    'NAV',
    'SECTION',
    'TABLE',
]

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


/**
 * 探索プログラム改善
 */
function getComponents() {
  const searchableElements = [...getSearchableElements()];

  // return sectionElements.length > headingParentElements.length ? sectionElements : headingParentElements;
  return searchableElements.map(getQuerySelector);
}

/**
 * section 要素を取得する
 */
function getSearchableElements() {
  const headingElements = document.querySelectorAll(SEARCHABLE_ELEMENTS.map(tag => tag.toLowerCase()).join(', '));
  const { clientWidth, clientHeight } = document.body;
  const ret = [];
  headingElements.forEach((heading) => {
      const { width, height } = heading.getBoundingClientRect();
      // console.log(`width: ${width} height: ${height} ${heading.tagName}`);
      if (width <= clientWidth && height < clientHeight) {
          ret.push(heading);
      }
  });
  return ret;
}