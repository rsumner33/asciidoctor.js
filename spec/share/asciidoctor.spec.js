var shareSpec = function (testOptions, asciidoctor) {

  var getCoreVersionNumber = function (asciidoctor) {
    var asciidoctorVersion = asciidoctor.getCoreVersion();
    // ignore the fourth number, keep only major, minor and patch numbers
    return parseInt(asciidoctorVersion.replace(/(\.|dev)/g, '').substring(0, 3));
  };

  describe(testOptions.platform, function () {

    describe('When loaded', function () {
      it('asciidoctor should not be null', function () {
        expect(asciidoctor).not.toBe(null);
      });
    });

    describe('Loading', function () {
      it('should load document with inline attributes @', function () {
        var options = {attributes: 'icons=font@'};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getAttribute('icons')).toBe('font');
      });

      it('should load document with inline attributes !', function () {
        var options = {attributes: 'icons=font@ data-uri!'};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getAttribute('icons')).toBe('font');
      });

      it('should load document attributes', function () {
        var options = {attributes: 'icons=font@ data-uri!'};
        var doc = asciidoctor.load('= Document Title\n:attribute-key: attribute-value\n\ncontent', options);
        expect(doc.getAttribute('attribute-key')).toBe('attribute-value');
      });

      it('should load document with array attributes !', function () {
        var options = {attributes: 'icons=font@ data-uri!'};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getAttribute('icons')).toBe('font');
        expect(doc.getAttribute('data-uri')).toBeUndefined();
      });

      it('should load document with hash attributes', function () {
        // NOTE we might want to look into the fact that sectids: false does not work
        var options = {attributes: {icons: 'font', sectids: null}};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getAttribute('icons')).toBe('font');
        expect(doc.getAttribute('sectids')).toBeUndefined();
        expect(doc.findBy({context: 'section'})[0].getId()).toBe(Opal.nil);
      });

      it('should load document with boolean attributes', function () {
        var options = {attributes: 'sectnums'};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getAttribute('sectnums')).toBe('');
        expect(doc.isAttribute('sectnums')).toBe(true);
        expect(doc.isAttribute('sectnums', 'not this')).toBe(false);
        expect(doc.isAttribute('sectanchors')).toBe(false);
        expect(doc.hasAttribute('sectnums')).toBe(true);
        expect(doc.hasAttribute('sectanchors')).toBe(false);
      });

      it('should load document authors', function () {
        var doc = asciidoctor.load('= Authors\nGuillaume Grossetie;Anders Nawroth\n');
        expect(doc.getAttribute('author')).toBe('Guillaume Grossetie');
        expect(doc.getAttribute('author_1')).toBe('Guillaume Grossetie');
        expect(doc.getAttribute('author_2')).toBe('Anders Nawroth');
        expect(doc.getAttribute('authorcount')).toBe(2);
        expect(doc.getAttribute('authorinitials')).toBe('GG');
        expect(doc.getAttribute('authorinitials_1')).toBe('GG');
        expect(doc.getAttribute('authorinitials_2')).toBe('AN');
        expect(doc.getAttribute('authors')).toBe('Guillaume Grossetie, Anders Nawroth');
        expect(doc.getAuthor()).toBe('Guillaume Grossetie');
      });

      it('should populate the catalog', function () {
        var doc = asciidoctor.load('link:index.html[Docs]', {'safe': 'safe', 'catalog_assets': true});
        doc.convert();
        var links = doc.getCatalog().links;
        expect(links).toEqual(['index.html']);
      });

      it('should return attributes as JSON object', function () {
        var doc = asciidoctor.load('= Authors\nGuillaume Grossetie;Anders Nawroth\n');
        expect(doc.getAttributes()['author']).toBe('Guillaume Grossetie');
        expect(doc.getAttributes()['authors']).toBe('Guillaume Grossetie, Anders Nawroth');
      });

      it('should get icon uri string reference', function () {
        var options = {attributes: 'data-uri!'};
        var doc = asciidoctor.load('== Test', options);
        // FIXME: On browser icon URI is './images/icons/note.png' but on Node.js icon URI is 'images/icons/note.png'
        expect(doc.getIconUri('note')).toContain('images/icons/note.png');
      });

      // FIXME: Skipping spec because the following error is thrown "SecurityError: Jail is not an absolute path: ."
      /*
      it('should get icon uri', function () {
        var options = {safe: 'safe', attributes: ['data-uri', 'icons=fonts']};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getIconUri('note')).toBe('data:image/png:base64,');
      });
      */

      it('should get media uri', function () {
        var doc = asciidoctor.load('== Test');
        expect(doc.getMediaUri('target')).toBe('target');
      });

      it('should get image uri', function () {
        var options = {attributes: 'data-uri!'};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getImageUri('target.jpg')).toBe('target.jpg');
        expect(doc.getImageUri('target.jpg', 'imagesdir')).toBe('target.jpg');
      });

      it('should modify document attributes', function () {
        var content = '== Title';
        var doc = asciidoctor.load(content);
        doc.setAttribute('data-uri', 'true');
        expect(doc.getAttribute('data-uri')).toBe('true');
        doc.removeAttribute('data-uri');
        expect(doc.getAttribute('data-uri')).toBeUndefined();
        doc.setAttribute('data-uri', 'false');
        expect(doc.getAttribute('data-uri')).toBe('false');
      });

      it('should get source', function () {
        var doc = asciidoctor.load('== Test');
        expect(doc.getSource()).toBe('== Test');
      });

      it('should get source lines', function () {
        var doc = asciidoctor.load('== Test\nThis is the first paragraph.\n\nThis is a second paragraph.');
        expect(doc.getSourceLines()).toEqual(['== Test', 'This is the first paragraph.', '', 'This is a second paragraph.']);
      });

      it('should get reader lines', function () {
        var doc = asciidoctor.load('line one\nline two\nline three', {parse: false});
        expect(doc.getReader().getLines()).toEqual(['line one', 'line two', 'line three']);
      });

      it('should get reader string', function () {
        var doc = asciidoctor.load('line one\nline two\nline three', {parse: false});
        expect(doc.getReader().getString()).toBe('line one\nline two\nline three');
      });

      it('should not be nested', function () {
        var doc = asciidoctor.load('== Test');
        expect(doc.isNested()).toBe(false);
      });

      it('should not have footnotes', function () {
        var doc = asciidoctor.load('== Test');
        expect(doc.hasFootnotes()).toBe(false);
      });

      it('should get footnotes', function () {
        var doc = asciidoctor.load('== Test');
        expect(doc.getFootnotes()).toEqual([]);
      });

      it('should not be embedded', function () {
        var options = {header_footer: true};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.isEmbedded()).toBe(false);
      });

      it('should be embedded', function () {
        var doc = asciidoctor.load('== Test');
        expect(doc.isEmbedded()).toBe(true);
      });

      it('should not have extensions enabled by default', function () {
        var asciidoctorVersionNumber = getCoreVersionNumber(asciidoctor);
        if (asciidoctorVersionNumber >= 157) {
          var doc = asciidoctor.load('== Test');
          // extensions should not be enabled by default
          expect(doc.hasExtensions()).toBe(false);
        }
      });

      it('should get document', function () {
        var options = {};
        var doc = asciidoctor.load('= Document Title\n\ncontent', options);
        expect(doc.getDocument()).toBe(doc);
        expect(doc.getBlocks()[0].getDocument()).toBe(doc);
      });

      it('should get parent node', function () {
        var options = {};
        var doc = asciidoctor.load('= Document Title\n\ncontent', options);
        expect(doc.getParent()).toBeUndefined();
        expect(doc.getBlocks()[0].getParent()).toBe(doc);
      });

      it('should get parent document', function () {
        var options = {};
        var doc = asciidoctor.load('= Document Title\n\n|===\na|subdoc\n|===', options);
        var table = doc.getBlocks()[0];
        expect(table.getContext()).toBe('table');
        var subdoc = table.rows.body[0][0].inner_document;
        expect(subdoc).not.toBe(doc);
        expect(subdoc.getParentDocument()).toBe(doc);
      });

      it('should have extensions enabled after being autoloaded', function () {
        try {
          asciidoctor.Extensions.register(function () {
          });
          var doc = asciidoctor.load('== Test');
          // extensions should be enabled after being autoloaded
          expect(doc.hasExtensions()).toBe(true);
          var extensions = doc.getExtensions();
          expect(extensions).toBeDefined();
          expect('groups' in extensions).toBe(true);
        } finally {
          asciidoctor.Extensions.unregisterAll();
        }
      });

      it('should get default doctype', function () {
        var doc = asciidoctor.load('== Test');
        expect(doc.getDoctype()).toBe('article');
      });

      it('should get doctype', function () {
        var options = {doctype: 'inline'};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getDoctype()).toBe('inline');
      });

      it('should get default backend', function () {
        var doc = asciidoctor.load('== Test');
        expect(doc.getBackend()).toBe('html5');
      });

      it('should get backend', function () {
        var options = {backend: 'xhtml5'};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getBackend()).toBe('html5');
        expect(doc.getAttribute('htmlsyntax')).toBe('xml');
      });

      it('should get safe mode', function () {
        var options = {safe: 'server'};
        var doc = asciidoctor.load('== Test', options);
        expect(doc.getSafe()).toBe(asciidoctor.$$const.SafeMode.$$const.SERVER);
        expect(doc.getAttribute('safe-mode-name')).toBe('server');
      });

      it('should get compat mode', function () {
        var options = {};
        var doc = asciidoctor.load('Document Title\n==============\n\ncontent', options);
        expect(doc.getCompatMode()).toBe(true);
      });

      it('should get options', function () {
        var options = {header_footer: true};
        var doc = asciidoctor.load('= Document Title', options);
        expect(doc.getOptions()).toBeDefined();
        expect(doc.getOptions().header_footer).toBe(true);
      });

      it('should get outfilesuffix', function () {
        var options = {};
        var doc = asciidoctor.load('= Document Title', options);
        expect(doc.getOutfilesuffix()).toBe('.html');
      });

      it('should get converter', function () {
        var options = {backend: 'xhtml'};
        var doc = asciidoctor.load('= Document Title', options);
        var converter = doc.getConverter();
        expect(converter).toBeDefined();
        expect(converter.xml_mode).toBe(true);
      });

      it('should get title', function () {
        var doc = asciidoctor.load('= The Dangerous Documentation Chronicles: Based on True Events\n:title: The Actual Dangerous Documentation Chronicles\n== The Ravages of Writing');
        expect(doc.getTitle()).toBe('The Actual Dangerous Documentation Chronicles');
        expect(doc.getCaptionedTitle()).toBe('The Actual Dangerous Documentation Chronicles');
      });

      it('should set title', function () {
        var doc = asciidoctor.load('= The Dangerous Documentation\n\n== The Ravages of Writing');
        doc.setTitle('The Dangerous & Thrilling Documentation');
        expect(doc.getDoctitle()).toBe('The Dangerous &amp; Thrilling Documentation');
      });

      it('should get the line of number of a block when sourcemap is enabled', function () {
        var options = {sourcemap: true};
        var doc = asciidoctor.load('= Document Title\n\nPreamble\n\n== First section\n\nTrue story!', options);
        expect(doc.getSourcemap()).toBe(true);
        var blocks = doc.getBlocks();
        expect(blocks.length).toBe(2);
        // preamble
        expect(blocks[0].getLineNumber()).toBeUndefined();
        expect(blocks[0].getBlocks().length).toBe(1);
        expect(blocks[0].getBlocks()[0].getLineNumber()).toBe(3);
        // first section
        expect(blocks[1].getLineNumber()).toBe(5);
      });

      it('should return undefined when sourcemap is disabled', function () {
        var options = {};
        var doc = asciidoctor.load('= Document Title\n\nPreamble\n\n== First section\n\nTrue story!', options);
        var blocks = doc.getBlocks();
        expect(blocks.length).toBe(2);
        // preamble
        expect(blocks[0].getLineNumber()).toBeUndefined();
        expect(blocks[0].getBlocks().length).toBe(1);
        expect(blocks[0].getBlocks()[0].getLineNumber()).toBeUndefined();
        // first section
        expect(blocks[1].getLineNumber()).toBeUndefined();
      });

      it('should get doctitle', function () {
        var doc = asciidoctor.load('= The Dangerous Documentation Chronicles: Based on True Events\n\n== The Ravages of Writing');
        expect(doc.getDoctitle()).toBe('The Dangerous Documentation Chronicles: Based on True Events');
      });

      it('should get partitioned doctitle', function () {
        var doc = asciidoctor.load('= The Dangerous Documentation Chronicles: Based on True Events\n\n== The Ravages of Writing');
        var doctitle = doc.getDoctitle({partition: true});
        expect(doctitle.main).toBe('The Dangerous Documentation Chronicles');
        expect(doctitle.subtitle).toBe('Based on True Events');
        expect(doctitle.getMain()).toBe('The Dangerous Documentation Chronicles');
        expect(doctitle.getSubtitle()).toBe('Based on True Events');
        expect(doctitle.getCombined()).toBe('The Dangerous Documentation Chronicles: Based on True Events');
        expect(doctitle.hasSubtitle()).toBe(true);
        expect(doctitle.isSanitized()).toBe(false);
      });

      it('should get partitioned doctitle without subtitle', function () {
        var doc = asciidoctor.load('= The Dangerous Documentation Chronicles\n\n== The Ravages of Writing');
        var doctitle = doc.getDoctitle({partition: true});
        expect(doctitle.getMain()).toBe('The Dangerous Documentation Chronicles');
        expect(doctitle.getSubtitle()).toBeUndefined();
        expect(doctitle.getCombined()).toBe('The Dangerous Documentation Chronicles');
        expect(doctitle.hasSubtitle()).toBe(false);
        expect(doctitle.isSanitized()).toBe(false);
      });

      it('should get counters', function () {
        var doc = asciidoctor.load('{counter:countme}\n\n{counter:countme}');
        doc.convert();
        var counters = doc.getCounters();
        expect(counters).toBeDefined();
        expect(counters.countme).toBe(2);
      });

      it('should get and set attribute on block', function () {
        var doc = asciidoctor.load('= Blocks story: Based on True Events\n\n== Once upon a time\n\n[bold-statement="on"]\nBlocks are amazing!');
        var paragraphBlock = doc.getBlocks()[0].getBlocks()[0];
        expect(paragraphBlock.getAttribute('bold-statement')).toBe('on');
        paragraphBlock.setAttribute('bold-statement', 'off');
        expect(paragraphBlock.getAttribute('bold-statement')).toBe('off');
      });

      it('should hide positional attributes in getAttributes', function () {
        var doc = asciidoctor.load('[positional1,positional2,attr=value]\ntext');
        var block = doc.getBlocks()[0];
        var attributes = block.getAttributes();
        expect(Object.getOwnPropertyNames(attributes).sort()).toEqual(['attr', 'style'].sort());
      });

      it('should assign sectname, caption, and numeral to appendix section by default', function () {
        var doc = asciidoctor.load('[appendix]\n== Attribute Options\n\nDetails');
        var appendix = doc.getBlocks()[0];
        expect(appendix.sectname).toBe('appendix');
        expect(appendix.caption).toBe('Appendix A: ');
        expect(appendix.getCaption()).toBe('Appendix A: ');
        expect(appendix.getCaptionedTitle()).toBe('Appendix A: Attribute Options');
        expect(appendix.number).toBe('A');
        expect(appendix.numbered).toBe(true);
      });

      it('remove_attr should remove attribute and return previous value', function () {
        var doc = asciidoctor.load('= Document\n\n== First section\n\n[foo="bar"]\nThis is a paragraph.');
        var paragraphBlock = doc.getBlocks()[0].getBlocks()[0];
        expect(paragraphBlock.getAttribute('foo')).toBe('bar');
        expect(paragraphBlock.removeAttribute('foo')).toBe('bar');
        expect(paragraphBlock.removeAttribute('foo')).toBeUndefined();
      });

      it('should get list of substitutions for block', function () {
        var source = '----\nverbatim <1>\n----\n<1> verbatim text';
        var listingBlock = asciidoctor.load(source).findBy({context: 'listing'})[0];
        expect(listingBlock.getSubstitutions()).toEqual(['specialcharacters', 'callouts']);
      });

      it('should return whether substitution exists', function () {
        var source = '----\nverbatim <1>\n----\n<1> verbatim text';
        var listingBlock = asciidoctor.load(source).findBy({context: 'listing'})[0];
        expect(listingBlock.hasSubstitution('callouts')).toBe(true);
        expect(listingBlock.hasSubstitution('macros')).toBe(false);
      });

      it('should get no section', function () {
        var source = '= Title\n\nNo section in here...';
        var doc = asciidoctor.load(source);
        expect(doc.hasSections()).toBe(false);
        expect(doc.getSections().length).toBe(0);
      });

      it('should get sections', function () {
        var source = '= Title\n:sectnums!:\n\n== First section\n\n:sectnums:\n== Second section\n\n[abstract]\n== Abstract section\n\n:appendix-caption: Appx\n[appendix]\n== Copyright and License';
        var doc = asciidoctor.load(source);
        expect(doc.hasSections()).toBe(true);
        expect(doc.getSections().length).toBe(4);
        var firstSection = doc.getSections()[0];
        expect(firstSection.getIndex()).toBe(0);
        expect(firstSection.getName()).toBe('First section');
        expect(firstSection.getTitle()).toBe('First section');
        expect(firstSection.title).toBe('First section');
        expect(firstSection.getSectionName()).toBe('section');
        expect(firstSection.isNumbered()).toBe(false);
        expect(firstSection.isSpecial()).toBe(false);
        expect(firstSection.getCaption()).toBeUndefined();
        var secondSection = doc.getSections()[1];
        expect(secondSection.getIndex()).toBe(1);
        expect(secondSection.getName()).toBe('Second section');
        expect(secondSection.getTitle()).toBe('Second section');
        expect(secondSection.title).toBe('Second section');
        expect(secondSection.getSectionName()).toBe('section');
        expect(secondSection.isNumbered()).toBe(true);
        expect(secondSection.isSpecial()).toBe(false);
        expect(secondSection.getCaption()).toBeUndefined();
        var abstractSection = doc.getSections()[2];
        expect(abstractSection.getIndex()).toBe(2);
        expect(abstractSection.getName()).toBe('Abstract section');
        expect(abstractSection.getTitle()).toBe('Abstract section');
        expect(abstractSection.title).toBe('Abstract section');
        expect(abstractSection.getSectionName()).toBe('abstract');
        expect(abstractSection.isNumbered()).toBe(false);
        expect(abstractSection.isSpecial()).toBe(true);
        expect(abstractSection.getCaption()).toBeUndefined();
        var appendixSection = doc.getSections()[3];
        expect(appendixSection.getIndex()).toBe(3);
        expect(appendixSection.getName()).toBe('Copyright and License');
        expect(appendixSection.getTitle()).toBe('Copyright and License');
        expect(appendixSection.title).toBe('Copyright and License');
        expect(appendixSection.getSectionName()).toBe('appendix');
        expect(appendixSection.isNumbered()).toBe(true);
        expect(appendixSection.isSpecial()).toBe(true);
        expect(appendixSection.getCaption()).toBe('Appx A: ');
      });

      it('should load a file with bom', function () {
        var opts = {safe: 'safe', base_dir: testOptions.baseDir};
        var doc = asciidoctor.load('\xef\xbb\xbf= Document Title\n:lang: fr\n:fixtures-dir: spec/fixtures\n\ncontent is in {lang}\n\ninclude::{fixtures-dir}/include.adoc[]', opts);
        expect(doc.getAttribute('lang')).toBe('fr');
        var html = doc.convert();
        expect(html).toContain('content is in fr');
        expect(html).toContain('include content');
      });
    });

    describe('Modifying', function () {
      it('should allow document-level attributes to be modified', function () {
        var doc = asciidoctor.load('= Document Title\n:lang: fr\n\ncontent is in {lang}');
        expect(doc.getAttribute('lang')).toBe('fr');
        doc.setAttribute('lang', 'us');
        expect(doc.getAttribute('lang')).toBe('us');
        var html = doc.convert();
        expect(html).toContain('content is in us');
      });

      it('should be able to remove substitution from block', function () {
        var source = '....\n<foobar>\n....';
        var literalBlock = asciidoctor.load(source).findBy({context: 'literal'})[0];
        literalBlock.removeSubstitution('specialcharacters');
        expect(literalBlock.hasSubstitution('specialcharacters')).toBe(false);
        expect(literalBlock.getContent()).toBe('<foobar>');
      });
    });

    describe('Parsing', function () {
      it('should convert a simple document with a title 2', function () {
        var html = asciidoctor.convert('== Test');
        expect(html).toContain('<h2 id="_test">Test</h2>');
      });

      it('should return an empty string when there\'s no candidate for inline conversion', function () {
        // Converting a document with inline document type should produce an empty string
        // Read more: http://asciidoctor.org/docs/user-manual/#document-types
        var options = {doctype: 'inline'};
        var content = '= Document Title\n\n== Introduction\n\nA simple paragraph.';
        var html = asciidoctor.convert(content, options);
        expect(html).toBe('');
        var doc = asciidoctor.load(content, options);
        html = doc.convert();
        expect(html).toBe('');
      });

      it('should convert a simple document with a title 3', function () {
        var html = asciidoctor.convert('=== Test');
        expect(html).toContain('<h3 id="_test">Test</h3>');
      });

      it('should convert a document with tabsize', function () {
        var html = asciidoctor.convert('= Learn Go\n:tabsize: 2\n\n[source]\n----\npackage main\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, playground")\n}\n----');
        expect(html).toContain('<div class="listingblock">\n<div class="content">\n<pre class="highlight"><code>package main\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, playground")\n}</code></pre>\n</div>\n</div>');
      });

      it('should convert a document with unicode', function () {
        var html = asciidoctor.convert('= HubPress\nAnthonny Quérouil\n\n{doctitle} was written by {firstname} {lastname}.\n\n[[bière]]\n== La bière\n\nLa bière c\'est la vie.\n\n[[ビール]]\n== ビール');
        expect(html).toContain('was written by Anthonny Quérouil.');
        expect(html).toContain('id="ビール"');
        expect(html).toContain('id="bière"');
      });

      it('should embed assets', function () {
        var options = {
          doctype: 'article',
          safe: 'unsafe',
          header_footer: true,
          attributes: ['showtitle', 'stylesheet=asciidoctor.css', 'stylesdir=' + testOptions.baseDir + '/build/css']
        };
        var html = asciidoctor.convert('=== Test', options);
        expect(html).toContain('Asciidoctor default stylesheet');
      });

      it('should produce a docbook45 document when backend=docbook45', function () {
        var options = {attributes: ['backend=docbook45', 'doctype=book'], header_footer: true};
        var html = asciidoctor.convert(':doctitle: DocTitle\n:docdate: 2014-01-01\n== Test', options);
        expect(html).toBe('<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<!DOCTYPE book PUBLIC "-//OASIS//DTD DocBook XML V4.5//EN" "http://www.oasis-open.org/docbook/xml/4.5/docbookx.dtd">\n' +
          '<?asciidoc-toc?>\n' +
          '<?asciidoc-numbered?>\n' +
          '<book lang="en">\n' +
          '<bookinfo>\n' +
          '<title>DocTitle</title>\n' +
          '<date>2014-01-01</date>\n' +
          '</bookinfo>\n' +
          '<chapter id="_test">\n' +
          '<title>Test</title>\n' +
          '\n' +
          '</chapter>\n' +
          '</book>');
      });

      it('should produce a docbook5 document when backend=docbook5', function () {
        var options = {attributes: ['backend=docbook5', 'doctype=book'], header_footer: true};
        var html = asciidoctor.convert(':doctitle: DocTitle\n:docdate: 2014-01-01\n== Test', options);
        expect(html).toBe('<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<?asciidoc-toc?>\n' +
          '<?asciidoc-numbered?>\n' +
          '<book xmlns="http://docbook.org/ns/docbook" xmlns:xl="http://www.w3.org/1999/xlink" version="5.0" xml:lang="en">\n' +
          '<info>\n' +
          '<title>DocTitle</title>\n' +
          '<date>2014-01-01</date>\n' +
          '</info>\n' +
          '<chapter xml:id="_test">\n' +
          '<title>Test</title>\n' +
          '\n' +
          '</chapter>\n' +
          '</book>');
      });

      it('should produce a html5 document with font icons', function () {
        var options = {attributes: 'icons=font@'};
        var html = asciidoctor.convert('= Document\n\nThis is a simple document.\n\n== Section\n\nCAUTION: This is important!', options);
        expect(html).toContain('<i class="fa icon-caution" title="Caution"></i>');
      });
    });

    describe('Wildcard character match', function () {
      it('should replace wildcard with negated line feed', function () {
        expect(asciidoctor.$$const.UnorderedListRx.source).not.toContain('.*');
        expect(asciidoctor.$$const.UnorderedListRx.source).toContain('[^\\n]*');
      });

      it('should match list item in an undered list item that has a trailing line separator', function () {
        var html = asciidoctor.convert('* a\n* b\u2028\n* c');
        expect(html).toContain('<li>\n<p>b</p>\n</li>');
      });

      it('should match line separator in text of list item in an unordered list', function () {
        var html = asciidoctor.convert('* a\n* b\u2028b');
        expect(html).toContain('<li>\n<p>b\u2028b</p>\n</li>');
      });

      it('should match line separator in text of list item in an ordered list', function () {
        var html = asciidoctor.convert('. a\n. b\u2028b');
        expect(html).toContain('<li>\n<p>b\u2028b</p>\n</li>');
      });

      it('should match line separator in text of list item in a description list', function () {
        var html = asciidoctor.convert('a:: a\nb:: b\u2028b');
        expect(html).toContain('<dd>\n<p>b\u2028b</p>\n</dd>');
      });

      it('should match line separator in text of list item in a nested description list', function () {
        var html = asciidoctor.convert('a:: a\nb:: b\nc::: c\u2028c\nd:: d');
        expect(html).toContain('<dd>\n<p>c\u2028c</p>\n</dd>');
      });

      it('should match line separator in text of list item in a callout list', function () {
        var html = asciidoctor.convert('----\nline 1 <1>\nline 2 <2>\n----\n<1> a\n<2> b\u2028b');
        expect(html).toContain('<li>\n<p>b\u2028b</p>\n</li>');
      });

      it('should match line separator in block title', function () {
        var html = asciidoctor.convert('.block\u2028title\ncontent');
        expect(html).toContain('<div class="title">block\u2028title</div>');
      });
    });

    describe('Escaping', function () {
      it('should escape table pipe', function () {
        var html = asciidoctor.convert('|===\n|`-a\\|-b`|Options cannot be used together\n|===');
        var columns = (html.match(/<td/g) || []).length;
        expect(columns).toBe(2);
      });
    });

    describe('Include', function () {
      it('should include file with a relative path (base_dir is explicitly defined)', function () {
        var opts = {safe: 'safe', base_dir: testOptions.baseDir};
        var html = asciidoctor.convert('include::spec/fixtures/include.adoc[]', opts);
        expect(html).toContain('include content');
      });

      it('should include file with a relative expandable path (base_dir is explicitly defined)', function () {
        var opts = {safe: 'safe', base_dir: testOptions.baseDir};
        var html = asciidoctor.convert('include::spec/../spec/fixtures/include.adoc[]', opts);
        expect(html).toContain('include content');
      });

      it('should include file with an absolute path (base_dir is not defined)', function () {
        var opts = {safe: 'safe', attributes: {'allow-uri-read': true}};
        var html = asciidoctor.convert('include::' + testOptions.baseDir + '/spec/fixtures/include.adoc[]', opts);
        expect(html).toContain('include content');
      });

      it('should include file with an absolute expandable path (base_dir is not defined)', function () {
        var opts = {safe: 'safe', attributes: {'allow-uri-read': true}};
        var html = asciidoctor.convert('include::' + testOptions.baseDir + '/spec/../spec/fixtures/include.adoc[]', opts);
        expect(html).toContain('include content');
      });

      it('should include csv file in table', function () {
        var opts = {safe: 'safe', base_dir: testOptions.baseDir};
        var html = asciidoctor.convert(',===\ninclude::spec/fixtures/sales.csv[]\n,===', opts);
        expect(html).toContain('March');
      });
    });

    describe('Converter', function () {
      it('should get converter factory', function () {
        var factory = asciidoctor.Converter.Factory.getDefault(false);
        expect(factory).toBeDefined();
        expect(factory.$$class.$name()).toBe('Asciidoctor::Converter::Factory');
      });

      it('should create instance of html5 converter', function () {
        var converter = asciidoctor.Converter.Factory.getDefault(false).create('html5');
        expect(converter).toBeDefined();
        expect(converter.$$class.$name()).toBe('Asciidoctor::Converter::Html5Converter');
      });

      it('should be able to convert node using converter instance retrieved from factory', function () {
        var converter = asciidoctor.Converter.Factory.getDefault(false).create('html5');
        var para = asciidoctor.load('text').getBlocks()[0];
        var result = converter.convert(para);
        expect(result).toContain('<p>text</p>');
      });
    });

    describe('Extensions', function () {
      it('should preprend the extension in the list', function () {
        var registry = asciidoctor.Extensions.create();
        var opts = {extension_registry: registry};
        registry.preprocessor(function () {
          var self = this;
          self.process(function (doc, reader) {
            var lines = reader.lines;
            for (var i = 0; i < lines.length; i++) {
              // starts with
              var match = lines[i].match(/\/\/ smiley/);
              if (match) {
                lines[i] = ':)';
              }
            }
            return reader;
          });
        });
        // this extension is prepended (higher precedence)
        registry.preprocessor(function () {
          var self = this;
          self.prepend();
          self.process(function (doc, reader) {
            var lines = reader.lines;
            for (var i = 0; i < lines.length; i++) {
              // starts with
              var match = lines[i].match(/\/\/ smiley/);
              if (match) {
                lines[i] = ':(';
              }
            }
            return reader;
          });
        });
        var resultWithExtension = asciidoctor.convert('// smiley', opts);
        expect(resultWithExtension).toContain(':('); // sad face because the second extension is prepended
      });

      it('should append the extension in the list (default)', function () {
        var registry = asciidoctor.Extensions.create();
        var opts = {extension_registry: registry};
        registry.preprocessor(function () {
          var self = this;
          self.process(function (doc, reader) {
            var lines = reader.lines;
            for (var i = 0; i < lines.length; i++) {
              // starts with
              var match = lines[i].match(/\/\/ smiley/);
              if (match) {
                lines[i] = ':)';
              }
            }
            return reader;
          });
        });
        // this extension is appended by default (lower precedence)
        registry.preprocessor(function () {
          var self = this;
          self.process(function (doc, reader) {
            var lines = reader.lines;
            for (var i = 0; i < lines.length; i++) {
              // starts with
              var match = lines[i].match(/\/\/ smiley/);
              if (match) {
                lines[i] = ':(';
              }
            }
            return reader;
          });
        });
        var resultWithExtension = asciidoctor.convert('// smiley', opts);
        expect(resultWithExtension).toContain(':)'); // happy face because the second extension is appended
      });
    });
  });
};

if (typeof module !== 'undefined' && module.exports) {
  // Node.
  module.exports = shareSpec;
} else if (typeof define === 'function' && define.amd) {
  // AMD. Register a named module.
  define('asciidoctor-share-spec', [''], function () {
    return shareSpec;
  });
}
