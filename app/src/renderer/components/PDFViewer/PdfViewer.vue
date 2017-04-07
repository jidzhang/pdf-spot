<template>
    <div>
        <div id="pdf-view">
            <canvas id="the-canvas"></canvas>
        </div>
        <ul id="right-click-menu" style="display: none;">
            <li>菜单1</li>
            <li>菜单2</li>
            <li>菜单3</li>
        </ul>
    </div>

</template>

<script>

    var $ = require('jquery')

    module.exports = {
        name: 'pdf-viewer',
        data: function () {
            return {
                pageIndex: 1,
                pageCount: 0,
                pageRendering: false,
                scale: 1.0,
                canvasId: 'the-canvas',
                theCanvas: null,
                thePage: null,
                thePdfFile: null,
                thePdfUrl: '/assets/elisp.pdf',
                theG2P:null,
                theViewPort:null,
                theFcanvas:null
            }
        },
        mounted: function () {
            this.$nextTick(function () {
                //disable pdf worker
                PDFJS.disableWorker = true;
                //init
                this.thePdfUrl = '/assets/elisp.pdf';
                this.pageIndex = 1;
                this.pageCount = 0;
                this.theCanvas = document.getElementById(this.canvasId);
                this.downloadPdf(this.thePdfUrl);

                //GrabTopan
                var scrollableContainer = document.getElementById('pdf-view')
                var g2p = new GrabToPan({
                    button: 1,
                    element: scrollableContainer,         // required
                    onActiveChanged: function (isActive) { // optional
                        if (window.console) { // IE doesn't define console unless the devtools are open
                            console.log('Grab-to-pan is ' + (isActive ? 'activated' : 'deactivated'))
                        }
                    }
                })
                g2p.deactivate()
                this.theG2P = g2p;
                //bind event
                this.eventBinding();
            })
        },
        methods: {
            /**
             * 上一页
             */
            prePage: function () {
                if (this.pageIndex <= 1) {
                    alert('已经是第一页');
                    return;
                }
                this.gotoPage(this.pageIndex - 1);
            },
            /**
             * 下一页
             */
            nextPage: function () {
                if (this.pageIndex >= this.pageCount) {
                    alert('已经是最后一页');
                    return;
                }
                this.gotoPage(this.pageIndex + 1);
            },
            /**
             * 转到某一页
             * @param pageIndex
             */
            gotoPage: function (pageIndex) {
                this.pageIndex = pageIndex;
                this.fetchPage();
            },
            downloadPdf: function (url) {
                if (!url) {
                    console.error('pdf url is null')
                    return false;
                }
                this.scale = 1.5
                var _this = this;
                var loadingTask = PDFJS.getDocument(url)
                loadingTask.promise.then(function (pdf) {
                    console.log('PDF loaded')
                    _this.pageCount = pdf.numPages
                    _this.thePdfFile = pdf
                    // Fetch the first page
                    _this.fetchPage()
                }, function (er) {
                    console.error(er)
                })
            },
            fetchPage: function () {
                var _this = this;
                this.thePdfFile.getPage(this.pageIndex).then(function (page) {
                    _this.thePage = page;
                    _this.pageRender()
                })
            },
            pageRender: function () {
                var page = this.thePage;
                this.closeContextMenu()
                if (!page) {
                    return
                }
                this.pageRendering = true
                //prepare
                var _this = this;
                var scale = this.scale;
                var theCanvas = this.theCanvas;
                //开辟视口
                var viewport = page.getViewport(scale)
                this.theViewPort = viewport;
                var viewBox = viewport.viewBox
                var centerX = (viewBox[2] + viewBox[0]) / 2
                var centerY = (viewBox[3] + viewBox[1]) / 2

                // Prepare theCanvas using PDF page dimensions
                var context = theCanvas.getContext('2d')
                theCanvas.height = viewport.height
                theCanvas.width = viewport.width

                // Render PDF page into theCanvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                }
                var renderTask = page.render(renderContext)
                renderTask.then(function () {
                    console.log('Page rendered');
                    //switch rendering state
                    _this.pageRendering = false
                    return
                    // draw a rect by fabric
                    var bg = theCanvas.toDataURL('image/png')
                    var fcanvas = new fabric.Canvas(canvasId, {selection: false})
                    fcanvas.setBackgroundImage(bg, fcanvas.renderAll.bind(fcanvas))
                    fcanvas.setWidth(viewport.width)
                    fcanvas.setHeight(viewport.height)
                    var rect = new fabric.Rect({
                        left: 100,
                        top: 100,
                        width: 50,
                        height: 50,
                        fill: '#FF454F',
                        opacity: 0.5,
                        transparentCorners: true,
                        borderColor: 'gray',
                        cornerColor: 'gray',
                        cornerSize: 5
                    })
                    fcanvas.add(rect)
                    fcanvas.renderAll()
                })
            },
            openContextMenu: function (e) {
                var $menu = $('#right-click-menu');
                $menu.css('top', e.y + 'px').css('left', e.x + 'px').show();
                $menu.focus();
            },
            closeContextMenu: function () {
                $('#right-click-menu').hide();
            },
            eventBinding: function () {
                var _this = this;
                var theCanvas = this.theCanvas;

                theCanvas.addEventListener('DOMMouseScroll', function (e) {
                    _this.stopEventBubble(e)
                }, true)

                theCanvas.addEventListener('mousewheel', function (e) {
                    if (_this.pageRendering) {
                        _this.stopEventBubble(e)
                        return
                    }
                    var delta = (e.wheelDelta / 120) * 0.2
                    _this.scale += delta
                    _this.pageRender()
                    _this.stopEventBubble(e)
                }, true)

                theCanvas.addEventListener('mousedown', function (e) {
                    if (e.button == 0) {
                        _this.closeContextMenu();
                        _this.theG2P.deactivate();
                    } else if (e.button == 1) {
                        _this.theG2P.activate();
                        _this.stopEventBubble(e)
                    }
                })

                theCanvas.addEventListener('mouseup', function (e) {
                    if (e.button == 1) {
                        //_this.theG2P.deactivate();
                    }
                })

                theCanvas.addEventListener('contextmenu', function (e) {
                    _this.openContextMenu(e);
                    _this.stopEventBubble(e)
                })

                $('#right-click-menu').blur(function () {
                    $(this).hide();
                });

                $('#prePage').click(function () {
                    _this.prePage();
                })

                $('#nextPage').click(function () {
                    _this.nextPage();
                })

                $('#drawLine').click(function () {
                    _this.drawLine();
                })
                $('#scaleAndPan').click(function () {
                    _this.scaleAndPan();
                })
                $('#load-pdf').change(function (event) {
                    var file = event.target.files[0]
                    var fileReader = new FileReader()
                    fileReader.onload = function () {
                        var typedarray = new Uint8Array(this.result)
                        _this.downloadPdf(typedarray)
                    }
                    fileReader.readAsArrayBuffer(file)
                })
            },
            stopEventBubble: function (e) {
                if (e.preventDefault) {
                    e.preventDefault()
                } else {
                    e.returnValue = false
                }

                if (e && e.stopPropagation) {
                    e.stopPropagation()
                } else {
                    window.event.cancelBubble = true
                }
            },
            scaleAndPan: function () {
                this.theG2P.activate();
                //var fcanvas = new fabric.Canvas(this.canvasId, {selection: false, isDrawingMode: false});
            },
            drawLine: function () {
                this.theG2P.deactivate();
                var theCanvas = document.getElementById(this.canvasId);
                var bg = theCanvas.toDataURL('image/png')
                var fcanvas = new fabric.Canvas(this.canvasId, {selection: false, isDrawingMode: true});
                fcanvas.setBackgroundImage(bg, fcanvas.renderAll.bind(fcanvas))
                fcanvas.setWidth(this.theViewPort.width)
                fcanvas.setHeight(this.theViewPort.height)
//                var rect = new fabric.Rect({
//                    left: 100,
//                    top: 100,
//                    width: 50,
//                    height: 50,
//                    fill: '#FF454F',
//                    opacity: 0.5,
//                    transparentCorners: true,
//                    borderColor: 'gray',
//                    cornerColor: 'gray',
//                    cornerSize: 5
//                })
//                fcanvas.add(rect)
                fcanvas.renderAll()
            }
        }
    }
</script>

<style scoped="">
    #pdf-view {
        max-height: 800px;
        overflow-x: auto;
        overflow-y: auto;
    }

    #right-click-menu {
        background: #FAFAFA;
        border: 1px solid #BDBDBD;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
        /*display: block;*/
        list-style: none;
        margin: 0;
        padding: 0;
        position: fixed;
        width: 200px;
        z-index: 999999;
    }

    #right-click-menu ul {
        list-style: none;
    }

    #right-click-menu li {
        border-bottom: 1px solid #E0E0E0;
        margin: 0;
        padding: 5px 20px;
    }

    #right-click-menu li:last-child {
        border-bottom: none;
    }

    #right-click-menu li:hover {
        background: #1E88E5;
        color: #FAFAFA;
    }
</style>