const tagMapping = new Map();
const cssMapping = new Map();
const initialize = () => {
    tagMapping.set('body',       { startTag: '<body>',     endTag: '</body>',    dsl: 'body'                });
    tagMapping.set('main',       { startTag: '<main>',     endTag: '</main>',    dsl: 'main'                });
    tagMapping.set('header',     { startTag: '<header>',   endTag: '</header>',  dsl: 'header'              });
    tagMapping.set('footer',     { startTag: '<footer>',   endTag: '</footer>',  dsl: 'footer'              });
    tagMapping.set('section',    { startTag: '<section>',  endTag: '</section>', dsl: 'section'             });
    tagMapping.set('article',    { startTag: '<article>',  endTag: '</article>', dsl: 'article'             });
    tagMapping.set('nav',        { startTag: '<nav>',      endTag: '</nav>',     dsl: 'nav'                 });
    tagMapping.set('aside',      { startTag: '<aside>',    endTag: '</aside>',   dsl: 'aside'               });
    tagMapping.set('h1',         { startTag: '<h1>',       endTag: '</h1>',      dsl: 'h1 {\ntext\n}'       });
    tagMapping.set('h2',         { startTag: '<h2>',       endTag: '</h2>',      dsl: 'h2 {\ntext\n}'       });
    tagMapping.set('h3',         { startTag: '<h3>',       endTag: '</h3>',      dsl: 'h3 {\ntext\n}'       });
    tagMapping.set('h4',         { startTag: '<h4>',       endTag: '</h4>',      dsl: 'h4 {\ntext\n}'       });
    tagMapping.set('h5',         { startTag: '<h5>',       endTag: '</h5>',      dsl: 'h5 {\ntext\n}'       });
    tagMapping.set('h6',         { startTag: '<h6>',       endTag: '</h6>',      dsl: 'h6 {\ntext\n}'       });
    tagMapping.set('p',          { startTag: '<p>',        endTag: '</p>',       dsl: 'text'                });
    tagMapping.set('span',       { startTag: '<span>',     endTag: '</span>',    dsl: 'text'                });
    tagMapping.set('table',      { startTag: '<table>',    endTag: '</table>',   dsl: 'table'               });
    tagMapping.set('thead',      { startTag: '<thead>',    endTag: '</thead>',   dsl: 'table-head'          });
    tagMapping.set('tbody',      { startTag: '<tbody>',    endTag: '</tbody>',   dsl: 'table-body'          });
    tagMapping.set('tr',         { startTag: '<tr>',       endTag: '</tr>',      dsl: 'table-row'           });
    tagMapping.set('th',         { startTag: '<th>',       endTag: '</th>',      dsl: 'table-cell {\ntext\n}' });
    tagMapping.set('td',         { startTag: '<td>',       endTag: '</td>',      dsl: 'table-cell {\ntext\n}' });
    tagMapping.set('div',        { startTag: '<div>',      endTag: '</div>',     dsl: 'container'           });
    tagMapping.set('image',      { startTag: '<img>',      endTag: '</img>',     dsl: 'image'               });

    // CSS Special Mapping
    cssMapping.set('display:flex', 'flex-row' );
    cssMapping.set('grid-template-columns:<1>', 'grid-one-row' );
    cssMapping.set('grid-template-columns:<2>', 'grid-two-row' );
    cssMapping.set('grid-template-columns:<3>', 'grid-three-row' );
    cssMapping.set('grid-template-columns:<4>', 'grid-four-row' );
    cssMapping.set('grid-template-columns:<5>', 'grid-five-row' );
};


const traverse = (element) => {
    try {
        const children     = element.children;
        const tagName      = element.tagName.toLowerCase();
        const mappedObject = tagMapping.has(tagName) ? tagMapping.get(tagName) : null;
        const computedCSS  = window.getComputedStyle(element);
        const mappedCSSKey = Array.from(cssMapping.keys()).find(cssKeyAndValue => {
            const [key, value] = cssKeyAndValue.split(':');
            // grid-template-columns special case
            if (value.includes('<') && value.includes('>')) {
                const computedValueCount = computedCSS[key]
                    ? computedCSS[key] !== 'none' ? computedCSS[key].split(' ').length : -1
                    : -1;
                const targetValueCount   = value.replace(/</g, '').replace(/>/g, '');
                return computedValueCount === parseInt(targetValueCount);
            }
            return computedCSS[key] === value;
        });
        const mappedCSS    = mappedCSSKey ? cssMapping.get(mappedCSSKey) : null;
        const priorityTag  = mappedCSS ? mappedCSS : mappedObject ? mappedObject.dsl : null;

        if (!priorityTag) {
            return null;
        }

        if (children) {
            const childDsl = [];
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const childObj = traverse(child);
                if (childObj) {
                    childDsl.push(childObj);
                }
            }
            if (childDsl.length === 0) {
                return priorityTag;
            }

            const childStr = childDsl.join(',');
            if (childStr.includes('{')) {
                return `${priorityTag} {\n${childDsl.join('\n')}\n}`;
            } else {
                return `${priorityTag} {\n${childStr}\n}`;
            }
        } else {
            return priorityTag;
        }
    } catch (error) {
        console.error(error.message);
        throw new Error(`Error: ${error.message}, ${element.tagName}`);
    }
}


const generateDSL = () => {
    initialize();
    const body = document.body;
    try {
        const dsl = traverse(body);

        return dsl;
    } catch (error) {
        console.error(error.message);
        return error.message;
    }
}