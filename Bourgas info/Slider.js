/**
 * Created by zeronoob on 27.7.2016 �..
 */
var NivooSlider = new Class({

    Implements: [Events, Options],

    caption: null,
    children: null,
    containerSize: 0,
    count: 0,
    currentSlide: 0,
    currentImage: '',
    effects: {
        horizontal: ['fade', 'fold', 'sliceLeftUp', 'sliceLeftDown', 'sliceLeftRightDown', 'sliceLeftRightUp', 'sliceRightDown', 'sliceRightUp'],
        vertical: ['fade', 'fold', 'sliceDownLeft', 'sliceDownRight', 'sliceUpDownLeft', 'sliceUpDownRight', 'sliceUpLeft', 'sliceUpRight']
    },
    hover: false,
    interval: null,
    paused: false,
    running: false,
    totalSlides: 0,

    options: {
        animSpeed: 500,
        autoPlay: true,
        cssClass: 'nivooSlider',
        directionNav: true,
        directionNavHide: false,
        effect: 'sliceDown',
        interval: 3000,
        orientation: 'vertical',
        pauseOnHover: true,
        slices: 15,

// not implemented yet
        preLoadImages: false

//onStart: $empty(),
//onFinish: $empty()
    },

    initialize: function (container, options) {
        this.container = $(container);
        this.setOptions(options);

        this.initSlider();
        this.createSlices();
        if (this.options.autoPlay) {
            this.play();
        }
    },

    /**
     * Getter
     */

    getImages: function () {
        return this.container.getElements('img');
    },

    getSlices: function () {
        return this.container.getElements('.nivoo-slice');
    },

    /**
     * Setter
     */

    setBackgroundImage: function () {
        this.container.setStyle('background-image', 'url(' + this.currentImage.get('src') + ')');
    },

    setCaptionText: function (text) {
        this.caption.set('text', text);
    },

    /**
     * Create
     */

    initSlider: function () {
        this.containerSize = this.container.getSize();

// Find our slider children
        this.children = this.getImages();

        this.totalSlides = this.children.length;

        this.children.setStyle('display', 'none');

        this.currentImage = this.children[0];

// init LinkHolder
        this.createLinkHolder();

// Set first background
        this.container.setStyle('background-image', 'url(' + this.currentImage.get('src') + ')');

        this.createCaption();

        this.showCaption();

// attach pauseOnHover
        if (this.options.pauseOnHover && this.options.autoPlay) {
            this.container.addEvents({
                'mouseenter': function () {
                    this.pause();
                }.bind(this),
                'mouseleave': function () {
                    this.play();
                }.bind(this)
            });
        }

// create directional navigation
        if (this.options.directionNav) {
            this.createDirectionNav();
        }

        this.container.addClass(this.options.cssClass);
    },

    createCaption: function () {
        this.caption = new Element('p', {
            styles: {
                opacity: 0
            }
        }).inject(this.container);

        this.caption.store('fxInstance', new Fx.Morph(this.caption, {
            duration: 200,
            wait: false
        }));
    },

    createDirectionNav: function () {
        var containerSize = this.container.getSize();

        var directionNavStyles = {
            height: containerSize.y,
            width: (containerSize.x / 5).round()
        };

// create container

        var leftContainer = new Element('div', {
            'class': 'direction-nav-left',
            styles: directionNavStyles
        }).inject(this.container);

        var rightContainer = new Element('div', {
            'class': 'direction-nav-right',
            styles: directionNavStyles
        }).inject(this.container);

// create controls

        this.leftNav = new Element('a', {
            events: {
                'click': function (e) {
                    e.stop();
                    if (this.options.autoPlay) {
                        this.pause();
                        if (!this.options.pauseOnHover) {
                            this.play();
                        }
                    }
                    this.previous();
                }.bind(this)
            },
            href: '#',
            styles: {
                height: directionNavStyles.height
            }
        }).inject(leftContainer);

        this.rightNav = new Element('a', {
            events: {
                'click': function (e) {
                    e.stop();
                    if (this.options.autoPlay) {
                        this.pause();
                        if (!this.options.pauseOnHover) {
                            this.play();
                        }
                    }
                    this.next();
                }.bind(this)
            },
            href: '#',
            styles: {
                height: directionNavStyles.height
            }
        }).inject(rightContainer);

        if (this.options.directionNavHide) {
            $$(this.leftNav, this.rightNav).setStyle('opacity', 0);
            this.container.addEvents({
                'mouseout': function () {
                    $$(this.leftNav, this.rightNav).fade(0);
                }.bind(this),
                'mouseover': function () {
                    $$(this.leftNav, this.rightNav).fade(1);
                }.bind(this)
            });
        }
    },

    createLinkHolder: function () {
        this.linkHolder = new Element('a', {
            'class': 'nivoo-link',
            href: '#'
        }).inject(this.container);
    },

    createSlices: function () {
        var sliceSize = {
            x: (this.container.getWidth() / this.options.slices).round(),
            y: (this.container.getHeight() / this.options.slices).round()
        };

        this.options.slices.each(function (i) {

            var slice = new Element('div', {
                'class': 'nivoo-slice'
            }).inject(this.container);

            var position = {
                left: this.options.orientation == 'vertical' ? sliceSize.x * i : 0,
                top: this.options.orientation == 'horizontal' ? sliceSize.y * i : 0
            };

// set size & position
            if (this.options.orientation == 'horizontal') {
                slice.setStyles({
                    height: i == this.options.slices - 1 ? this.container.getHeight() - (sliceSize.y * i) : sliceSize.y,
                    top: position.top,
                    width: '100%'
                });
            }
// if vertical
            else {
                slice.setStyles({
                    left: position.left,
                    width: i == this.options.slices - 1 ? this.container.getWidth() - (sliceSize.x * i) : sliceSize.x
                });
            }
            slice.store('fxInstance', new Fx.Morph(slice, {
                duration: this.options.animSpeed
            })).store('position', position);
        }, this);
    },

    /**
     * Caption
     */

    hideCaption: function () {
        this.caption.retrieve('fxInstance').start({
            bottom: this.caption.getHeight() * -1,
            opacity: 0.5
        });
    },

    showCaption: function () {
        var title = this.currentImage.get('title');

        if (!title) {
            this.hideCaption();
            return;
        }

        this.setCaptionText(title);

        this.caption.retrieve('fxInstance').start({
            bottom: 0,
            opacity: 1
        });
    },

    /**
     * Slide / Animations
     */

    next: function () {
        this.currentSlide++;

        if (this.currentSlide == this.totalSlides) {
            this.currentSlide = 0;
        }

        this.slide();
    },

    pause: function () {
        window.clearInterval(this.interval);
    },

    play: function () {
        this.interval = this.next.periodical(this.options.interval, this);
    },

    previous: function () {
        if (this.options.autoPlay) {
            this.pause();
            if (!this.options.pauseOnHover) {
                this.play();
            }
        }

        this.currentSlide--;

        if (this.currentSlide < 0) {
            this.currentSlide = (this.totalSlides - 1);
        }

        this.slide();
    },

    slide: function (slideNo) {
        if (this.running) {
            return;
        }

        if (slideNo != undefined) {
            this.currentSlide = slideNo;
        }

// Set currentImage
        this.currentImage = this.children[this.currentSlide];

//Set active link
        var imageParent = this.currentImage.getParent();

        if (imageParent.get('tag') == 'a') {
            this.linkHolder.setStyle('display', 'block').set('href', imageParent.get('href'));
        }
        else {
            this.linkHolder.setStyle('display', 'none');
        }

// Process caption
        this.showCaption();

        var slices = this.getSlices();
        var timeBuff = 0;

//Set new slice backgrounds
        var orientation = this.options.orientation;

        slices.each(function (slice) {

            var position = slice.retrieve('position');

            slice.setStyles({
                background: 'url(' + this.currentImage.get('src') + ') no-repeat -' + position.left + 'px '
                + position.top * -1 + 'px',
                opacity: 0
            });

            var property = orientation == 'horizontal' ? 'width' : 'height';

            slice.setStyle(property, 0);
        }, this);

// fire onStart function
        this.start();

// Run effects
        this.running = true;

        var effect = this.options.effect;

        if (effect == 'random') {
            effect = this.effects[orientation].getRandom();
        }

// vertical effects
        if (['sliceDownRight', 'sliceDownLeft'].contains(effect)) {
            if (effect == 'sliceDownLeft') {
                slices = slices.reverse();
            }

            slices.each(function (slice) {
                slice.setStyle('top', 0);

                this.animate.delay(100 + timeBuff, this, [slice, 'height', this.containerSize.y]);

                timeBuff += 50;
            }, this);
        }
        else if (['sliceUpRight', 'sliceUpLeft'].contains(effect)) {
            if (effect == 'sliceUpLeft') {
                slices = slices.reverse();
            }

            slices.each(function (slice) {
                var fx = slice.retrieve('fxInstance');

                slice.setStyle('bottom', 0);

                this.animate.delay(100 + timeBuff, this, [slice, 'height', this.containerSize.y]);

                timeBuff += 50;
            }, this);
        }
        else if (['sliceUpDownRight', 'sliceUpDownLeft'].contains(effect)) {
            if (effect == 'sliceUpDownLeft') {
                slices = slices.reverse();
            }

            slices.each(function (slice, i) {
                if (i % 2 == 0) {
                    slice.setStyle('top', 0);
                }
                else {
                    slice.setStyle('bottom', 0);
                }

                this.animate.delay(100 + timeBuff, this, [slice, 'height', this.containerSize.y]);

                timeBuff += 50;
            }, this);
        }

// horizontal effects
        else if (['sliceLeftUp', 'sliceLeftDown', 'sliceRightDown', 'sliceRightUp'].contains(effect)) {
            if (effect == 'sliceLeftUp' || effect == 'sliceRightUp') {
                slices = slices.reverse();
            }

            if (effect == 'sliceRightDown' || effect == 'sliceRightUp') {
                slices.setStyle('right', 0);
            }
            else {
                slices.setStyle('left', 0);
            }

            slices.each(function (slice) {
                this.animate.delay(100 + timeBuff, this, [slice, 'width', this.containerSize.x]);

                timeBuff += 50;
            }, this);
        }
        else if (['sliceLeftRightDown', 'sliceLeftRightUp'].contains(effect)) {
            if (effect == 'sliceLeftRightUp') {
                slices = slices.reverse();
            }

            slices.each(function (slice, i) {
                if (i % 2 == 0) {
                    slice.setStyle('left', 0);
                }
                else {
                    slice.setStyle('right', 0);
                }

                this.animate.delay(100 + timeBuff, this, [slice, 'width', this.containerSize.x]);

                timeBuff += 50;
            }, this);
        }

// horizontal or vertical
        else if (effect == 'fold') {
            slices.each(function (slice) {
                if (orientation == 'horizontal') {
                    var property = 'height';
                    var to = slice.getHeight();

                    slice.setStyles({
                        height: 0,
                        width: this.containerSize.x
                    });
                }
                else {
                    var property = 'width';
                    var to = slice.getWidth();

                    slice.setStyles({
                        height: this.containerSize.y,
                        top: 0,
                        width: 0
                    });
                }

                this.animate.delay(100 + timeBuff, this, [slice, property, to]);
                timeBuff += 50;
            }, this);
        }
        else  // if(effect == 'fade')
        {
            slices.each(function (slice) {
                if (orientation == 'horizontal') {
                    slice.setStyle('width', this.containerSize.x);
                }
                else {
                    slice.setStyle('height', this.containerSize.y);
                }
                this.animate.delay(100, this, [slice]);
            }, this);
        }
    },

    animate: function (slice, property, to) {
        var fx = slice.retrieve('fxInstance');

        var styles = {
            opacity: 1
        };

        if (property != undefined && to != undefined) {
            styles[property] = to;
        }

        fx.start(styles).chain(function () {
            this.count++;
            if (this.count == this.options.slices) {
                this.running = false;

// fire onFinish function
                this.finish();

                this.setBackgroundImage();

                this.count = 0;
            }
        }.bind(this));
    },

    /**
     * Events
     */

    finish: function () {
        this.fireEvent('finish');
    },

    start: function () {
        this.fireEvent('start');
    }

});

