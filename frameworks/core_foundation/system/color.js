// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  Provides colorspace conversions between rgb and hsl.

  This object can be instantiated by using `create`
  if it's a simple RGB color, or through `SC.Color.from`,
  which will turn any valid CSS color into it's
  appropriate SC.Color.

  Colors are immutable objects, and new ones should
  be created when dealing when you want to adjust a
  color's values.

  To get the CSS value of the color, call `toCSS`,
  which will provide the best CSS color to use
  according to browser support. This means that
  in IE, colors with an alpha channel will fall
  back to use ARGB, which requires the following
  hack to use:

      // This hack disables ClearType on IE!
      var color = SC.Color.from('rgba(0, 0, 0, .5)').toCSS(),
          css;
      if (SC.Color.supportsARGB) {
        var gradient = "progid:DXImageTransform.Microsoft.gradient";
        css = ("-ms-filter:" + gradient + "(startColorstr=%@1,endColorstr=%@1);" +
               "filter:" + gradient + "(startColorstr=%@1,endColorstr=%@1)" + 
               "zoom: 1").fmt(color);
      } else {
        css = "background-color:" + color;
      }

  You may want to use the `sub`, `add`, and `mult`
  functions to tween colors between a start and
  end color.

  For instance, if we wanted to tween between
  the color "blue" and "teal", we would to the following:

     var blue = SC.Color.from("blue"),
         teal = SC.Color.from("teal"),
         delta = blue.sub(teal);

     // Tick is called using a percent
     // between 0 and 1
     function tick (t) {
       return blue.add(delta.mult(t)).toCSS();
     }

  @extends SC.Object
  @extends SC.Freezable
 */
SC.Color = SC.Object.extend(
  SC.Freezable,
  /** @scope SC.Color.prototype */{

  /**
    The original color string that
    this object was created from.
    @type String
    @default null
   */
  original: null,

  /**
    The alpha channel (opacity).
    @type Number
    @default 1
   */
  a: 1,

  /**
    The red value.
    @type Number
    @default 0
   */
  r: 0,

  /**
    The green value.
    @type Number
    @default 0
   */
  g: 0,

  /**
    The blue value.
    @type Number
    @default 0
   */
  b: 0,

  /**
    Whether two colors are equivalent.
    @param {SC.Color} color The color to compare.
    @returns {Boolean} Whether the two colors are equivalent.
   */
  isEqualTo: function (color) {
    return this.r === color.r &&
           this.g === color.g &&
           this.b === color.b &&
           this.a === color.a;
  },

  /**
    Returns a CSS string of the color
    under the #aarrggbb scheme.

    This color is only valid for IE
    filters. This is here as a hack
    to support animating rgba values
    in older versions of IE by using
    filter gradients with no change in
    the actual gradient.

    @returns {String} The color in the rgba color space as a hex value.
   */
  toARGB: function () {
    var a = Math.round(255 * this.a).toString(16);
    return '#' + (a.length === 1 ? '0' + a : a) +
                 this.toHex().slice(1);
  },

  /**
    Returns a CSS string of the color
    under the #rrggbb scheme.

    @returns {String} The color in the rgb color space as a hex value.
   */
  toHex: function () {
    return '#' + [this.r, this.g, this.b].map(function (v) {
      v = v.toString(16);
      return v.length === 1 ? '0' + v : v;
    }).join('');
  },

  /**
    Returns a CSS string of the color
    under the rgb() scheme.

    @returns {String} The color in the rgb color space.
   */
  toRGB: function () {
    return 'rgb(' + this.r + ','
                  + this.g + ','
                  + this.b + ')';
  },

  /**
    Returns a CSS string of the color
    under the rgba() scheme.

    @returns {String} The color in the rgba color space.
   */
  toRGBA: function () {
    var rgb = this.toRGB();
    return 'rgba' + rgb.slice(3, -1) + ',' + this.a + ')';
  },

  /**
    Returns a CSS string of the color
    under the hsl() scheme.

    @returns {String} The color in the hsl color space.
   */
  toHSL: function () {
    var r = this.r / 255,
        g = this.g / 255,
        b = this.b / 255,
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        h, s, l = (max + min) / 2,
        d = max - min;

    // achromatic
    if (max === min) {
      h = s = 0;
    } else {
      s = l > 0.5
          ? d / (2 - max - min)
          : d / (max + min);

      switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      }
      h /= 6;
    }
    h = Math.floor(h * 360);
    s = Math.floor(s * 100);
    l = Math.floor(l * 100);

    return 'hsl(' + h + ','
                  + s + '%,'
                  + l + '%)';
  },

  /**
    Returns a CSS string of the color
    under the hsla() scheme.

    @returns {String} The color in the hsla color space.
   */
  toHSLA: function () {
    var hsl = this.toHSL();
    return 'hsla' + hsl.slice(3, -1) + ',' + this.a + ')';
  },

  /**
    Returns the string representation
    that will be best displayed by the
    current browser.

    @returns {String} The CSS value of this color.
   */
  toCSS: function () {
    return (this.a === 1)
           ? this.toHex()
           : SC.Color.supportsRGBA
           ? this.toRGBA()
           : this.toARGB();
  },

  /**
    Returns a new color with the hue rotated
    the provided number of degrees in the hsl colorspace.
    @param {Number} deg The number of degrees to rotate the hue.
    @returns {SC.Color} The color with it's hue rotated.
   */
  rotate: function (deg) {
    var hsla = this.toHSLA();
    hsla = hsla.match(SC.Color.PARSE_HSLA);
    deg += parseInt(hsla[1], 10);

    return SC.Color.from('hsla(' + deg + ','
                                 + hsla[2] + '%,'
                                 + hsla[3] + '%,'
                                 + hsla[4] + ')').freeze();
  },

  /**
    Returns a new color lightened by a given amount.

    The `amount` should be an int between 0 and 100
    for this to make sense.

    @param {Number} amount The amount that this color should be lightened
    @returns {SC.Color} The lightened color.
   */
  lighten: function (amount) {
    var hsla = this.toHSLA(),
        lightness;
    hsla = hsla.match(SC.Color.PARSE_HSLA);
    lightness = parseInt(hsla[3], 10) + amount;

    return SC.Color.from('hsla(' + hsla[1] + ','
                                 + hsla[2] + '%,'
                                 + lightness + '%,'
                                 + hsla[4] + ')').freeze();
  },

  /**
    Returns a new color darkened by a given amount.

    The `amount` should be an int between 0 and 100
    for this to make sense.

    @param {Number} amount The amount that this color should be darkened
    @returns {SC.Color} The lightened color.
   */
  darken: function (amount) {
    return this.lighten(-1 * amount);
  },

  /**
    Returns a saturated version of this color.

    The `amount` should be an int between 0 and 100
    for this to make sense.

    @param {Number} amount The amount that this color should be saturated
    @returns {SC.Color} The saturated color.
   */
  saturate: function (amount) {
    var hsla = this.toHSLA(),
        saturation;
    hsla = hsla.match(SC.Color.PARSE_HSLA);
    saturation = parseInt(hsla[2], 10) + amount;

    return SC.Color.from('hsla(' + hsla[1] + ','
                                 + saturation + '%,'
                                 + hsla[3] + '%,'
                                 + hsla[4] + ')').freeze();
  },

  /**
    Returns a desaturated version of this color.

    The `amount` should be an int between 0 and 100
    for this to make sense.

    @param {Number} amount The amount that this color should be desaturated
    @returns {SC.Color} The desaturated color.
   */
  desaturate: function (amount) {
    return this.saturate(-1 * amount);
  },

  /**
    Returns a color that's the difference between two colors.

    Note that the result might not be a valid CSS color.

    @param {SC.Color} color The color to subtract from this one.
    @returns {SC.Color} The difference between the two colors
   */
  sub: function (color) {
    return SC.Color.create({
      r: this.r - color.r,
      g: this.g - color.g,
      b: this.b - color.b,
      a: this.a - color.a
    }).freeze();
  },

  /**
    Returns a color that's the addition of two colors.

    Note that the result might not be a valid CSS color.

    @param {SC.Color} color The color to add to this one.
    @returns {SC.Color} The addition of the two colors
   */
  add: function (color) {
    return SC.Color.create({
      r: this.r + color.r,
      g: this.g + color.g,
      b: this.b + color.b,
      a: this.a + color.a
    }).freeze();
  },

  /**
    Returns a color that has it's units uniformly multiplied
    by a given multiplier.

    Note that the result might not be a valid CSS color.

    @param {Number} multipler How much to multiply rgba by.
    @returns {SC.Color} The adjusted color
   */
  mult: function (multiplier) {
    var round = Math.round;
    return SC.Color.create({
      r: round(this.r * multiplier),
      g: round(this.g * multiplier),
      b: round(this.b * multiplier),
      a: this.a * multiplier
    }).freeze();
  }
});

SC.Color.mixin(
  /** @scope SC.Color */{

  /**
    Whether this browser supports the rgba color model.
    Check courtesy of Modernizr.
    @type Boolean
    @see https://github.com/Modernizr/Modernizr/blob/master/modernizr.js#L552
   */
  supportsRGBA: (function () {
    var style = document.getElementsByTagName('script')[0].style,
        cssText = style.cssText,
        supported;

    style.cssText = 'background-color:rgba(5,2,1,.5)';
    supported = style.backgroundColor.indexOf('rgba') !== -1;
    style.cssText = cssText;
    return supported;
  }()),

  /**
    Used to clamp a value in between a minimum
    value and a maximum value.

    @param {Number} value The value to clamp.
    @param {Number} min The minimum number the value can be.
    @param {Number} max The maximum number the value can be.
    @returns {Number} The value clamped between min and max.
   */
  clamp: function (value, min, max) {
    return Math.max(Math.min(value, max), min);
  },

  /**
    Clamps a number, then rounds it to the nearest integer.

    @param {Number} value The value to clamp.
    @param {Number} min The minimum number the value can be.
    @param {Number} max The maximum number the value can be.
    @returns {Number} The value clamped between min and max as an integer.
    @see SC.Color.clamp
   */
  clampInt: function (value, min, max) {
    return Math.round(this.clamp(value, min, max));
  },

  /**
    Returns the RGB for a color defined in
    the HSL color space.

    Note that the parameters `h`, `s`, and `l`
    are normalized to be Numbers between 0 and 1.

    (Notes are taken from the W3 spec, and are
     written in ABC)

    @param {Number} h The hue of the color
    @param {Number} s The saturation of the color
    @param {Number} l The luminosity of the color
    @see http://www.w3.org/TR/css3-color/#hsl-color
   */
  hslToRGB: function (h, s, l) {
  // HOW TO RETURN hsl.to.rgb(h, s, l):
    var m1, m2, hueToRGB = SC.Color.hueToRGB;
    // SELECT:
      // l<=0.5: PUT l*(s+1) IN m2
      // ELSE: PUT l+s-l*s IN m2
    m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    // PUT l*2-m2 IN m1
    m1 = l * 2 - m2;
    // PUT hue.to.rgb(m1, m2, h+1/3) IN r
    // PUT hue.to.rgb(m1, m2, h    ) IN g
    // PUT hue.to.rgb(m1, m2, h-1/3) IN b
    // RETURN (r, g, b)
    return [hueToRGB(m1, m2, h + 1/3) * 255,
            hueToRGB(m1, m2, h)       * 255,
            hueToRGB(m1, m2, h - 1/3) * 255];
  },

  /**
    Returns the RGB value for a given hue.
   */
  hueToRGB: function (m1, m2, h) {
    // HOW TO RETURN hue.to.rgb(m1, m2, h):
    // IF h<0: PUT h+1 IN h
    if (h < 0) h++;
    // IF h>1: PUT h-1 IN h
    if (h > 1) h--;
    // IF h*6<1: RETURN m1+(m2-m1)*h*6
    if (h < 1/6) return m1 + (m2 - m1) * h * 6;
    // IF h*2<1: RETURN m2
    if (h < 1/2) return m2;
    // IF h*3<2: RETURN m1+(m2-m1)*(2/3-h)*6
    if (h < 2/3) return m1 + (m2 - m1) * (2/3 - h) * 6;
    // RETURN m1
    return m1;
  },

  // ..........................................................
  // Regular expressions for accepted color types
  // 
  PARSE_RGBA: /^rgba\(([\d]+%?),\s*([\d]+%?),\s*([\d]+%?),\s*([.\d]+)\)$/,
  PARSE_RGB : /^rgb\(([\d]+%?),\s*([\d]+%?),\s*([\d]+%?)\)$/,
  PARSE_HSLA: /^hsla\(([\d]+),\s*([\d]+)%,\s*([\d]+)%,\s*([.\d]+)\)$/,
  PARSE_HSL : /^hsl\(([\d]+),\s*([\d]+)%,\s*([\d]+)%\)$/,
  PARSE_HEX : /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
  PARSE_ARGB: /^#[0-9a-fA-F]{8}$/,

  /**
    A mapping of anglicized colors to their hexadecimal
    representation.

    Computed by running the following code at http://www.w3.org/TR/css3-color

       var T = {}, color = null,
           colors = document.querySelectorAll('.colortable')[1].querySelectorAll('.c');

       for (var i = 0; i < colors.length; i++) {
         if (i % 4 === 0) {
           color = colors[i].getAttribute('style').split(':')[1];
         } else if (i % 4 === 1) {
           T[color] = colors[i].getAttribute('style').split(':')[1].toUpperCase();
         }
       }
       JSON.stringify(T);

    @see http://www.w3.org/TR/css3-color/#svg-color
   */
  KEYWORDS: {"aliceblue":"#F0F8FF","antiquewhite":"#FAEBD7","aqua":"#00FFFF","aquamarine":"#7FFFD4","azure":"#F0FFFF","beige":"#F5F5DC","bisque":"#FFE4C4","black":"#000000","blanchedalmond":"#FFEBCD","blue":"#0000FF","blueviolet":"#8A2BE2","brown":"#A52A2A","burlywood":"#DEB887","cadetblue":"#5F9EA0","chartreuse":"#7FFF00","chocolate":"#D2691E","coral":"#FF7F50","cornflowerblue":"#6495ED","cornsilk":"#FFF8DC","crimson":"#DC143C","cyan":"#00FFFF","darkblue":"#00008B","darkcyan":"#008B8B","darkgoldenrod":"#B8860B","darkgray":"#A9A9A9","darkgreen":"#006400","darkgrey":"#A9A9A9","darkkhaki":"#BDB76B","darkmagenta":"#8B008B","darkolivegreen":"#556B2F","darkorange":"#FF8C00","darkorchid":"#9932CC","darkred":"#8B0000","darksalmon":"#E9967A","darkseagreen":"#8FBC8F","darkslateblue":"#483D8B","darkslategray":"#2F4F4F","darkslategrey":"#2F4F4F","darkturquoise":"#00CED1","darkviolet":"#9400D3","deeppink":"#FF1493","deepskyblue":"#00BFFF","dimgray":"#696969","dimgrey":"#696969","dodgerblue":"#1E90FF","firebrick":"#B22222","floralwhite":"#FFFAF0","forestgreen":"#228B22","fuchsia":"#FF00FF","gainsboro":"#DCDCDC","ghostwhite":"#F8F8FF","gold":"#FFD700","goldenrod":"#DAA520","gray":"#808080","green":"#008000","greenyellow":"#ADFF2F","grey":"#808080","honeydew":"#F0FFF0","hotpink":"#FF69B4","indianred":"#CD5C5C","indigo":"#4B0082","ivory":"#FFFFF0","khaki":"#F0E68C","lavender":"#E6E6FA","lavenderblush":"#FFF0F5","lawngreen":"#7CFC00","lemonchiffon":"#FFFACD","lightblue":"#ADD8E6","lightcoral":"#F08080","lightcyan":"#E0FFFF","lightgoldenrodyellow":"#FAFAD2","lightgray":"#D3D3D3","lightgreen":"#90EE90","lightgrey":"#D3D3D3","lightpink":"#FFB6C1","lightsalmon":"#FFA07A","lightseagreen":"#20B2AA","lightskyblue":"#87CEFA","lightslategray":"#778899","lightslategrey":"#778899","lightsteelblue":"#B0C4DE","lightyellow":"#FFFFE0","lime":"#00FF00","limegreen":"#32CD32","linen":"#FAF0E6","magenta":"#FF00FF","maroon":"#800000","mediumaquamarine":"#66CDAA","mediumblue":"#0000CD","mediumorchid":"#BA55D3","mediumpurple":"#9370DB","mediumseagreen":"#3CB371","mediumslateblue":"#7B68EE","mediumspringgreen":"#00FA9A","mediumturquoise":"#48D1CC","mediumvioletred":"#C71585","midnightblue":"#191970","mintcream":"#F5FFFA","mistyrose":"#FFE4E1","moccasin":"#FFE4B5","navajowhite":"#FFDEAD","navy":"#000080","oldlace":"#FDF5E6","olive":"#808000","olivedrab":"#6B8E23","orange":"#FFA500","orangered":"#FF4500","orchid":"#DA70D6","palegoldenrod":"#EEE8AA","palegreen":"#98FB98","paleturquoise":"#AFEEEE","palevioletred":"#DB7093","papayawhip":"#FFEFD5","peachpuff":"#FFDAB9","peru":"#CD853F","pink":"#FFC0CB","plum":"#DDA0DD","powderblue":"#B0E0E6","purple":"#800080","red":"#FF0000","rosybrown":"#BC8F8F","royalblue":"#4169E1","saddlebrown":"#8B4513","salmon":"#FA8072","sandybrown":"#F4A460","seagreen":"#2E8B57","seashell":"#FFF5EE","sienna":"#A0522D","silver":"#C0C0C0","skyblue":"#87CEEB","slateblue":"#6A5ACD","slategray":"#708090","slategrey":"#708090","snow":"#FFFAFA","springgreen":"#00FF7F","steelblue":"#4682B4","tan":"#D2B48C","teal":"#008080","thistle":"#D8BFD8","tomato":"#FF6347","turquoise":"#40E0D0","violet":"#EE82EE","wheat":"#F5DEB3","white":"#FFFFFF","whitesmoke":"#F5F5F5","yellow":"#FFFF00","yellowgreen":"#9ACD32"},

  /**
    Parses a CSS color into a `SC.Color` object.
    Any valid CSS color should work here.

    @param {String} color The color to parse into a `SC.Color` object.
    @param {SC.Color} The color object representing the color passed in.
   */
  from: function (color) {
    var C = SC.Color,
        oColor = color,
        r, g, b, a = 1,
        percentOrDeviceGamut = function (value) {
          var v = parseInt(value, 10);
          return value.slice(-1) === "%"
                 ? C.clampInt(v * 2.55, 0, 255)
                 : C.clampInt(v, 0, 255);
        };

    if (C.KEYWORDS.hasOwnProperty(color)) {
      color = C.KEYWORDS[color];
    }

    if (C.PARSE_RGB.test(color)) {
      color = color.match(C.PARSE_RGB);

      r = percentOrDeviceGamut(color[1]);
      g = percentOrDeviceGamut(color[2]);
      b = percentOrDeviceGamut(color[3]);

    } else if (C.PARSE_RGBA.test(color)) {
      color = color.match(C.PARSE_RGBA);

      r = percentOrDeviceGamut(color[1]);
      g = percentOrDeviceGamut(color[2]);
      b = percentOrDeviceGamut(color[3]);

      a = parseFloat(color[4], 10);

    } else if (C.PARSE_HEX.test(color)) {
      // The three-digit RGB notation (#rgb)
      // is converted into six-digit form (#rrggbb)
      // by replicating digits, not by adding zeros.
      if (color.length === 4) {
        color = '#' + color.charAt(1) + color.charAt(1)
                    + color.charAt(2) + color.charAt(2)
                    + color.charAt(3) + color.charAt(3);
      }

      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);

    } else if (C.PARSE_ARGB.test(color)) {
      r = parseInt(color.slice(3, 5), 16);
      g = parseInt(color.slice(5, 7), 16);
      b = parseInt(color.slice(7, 9), 16);

      a = parseInt(color.slice(1, 3), 16) / 255;

    } else if (C.PARSE_HSL.test(color)) {
      color = color.match(C.PARSE_HSL);
      color = C.hslToRGB(((parseInt(color[1], 10) % 360 + 360) % 360) / 360,
                         C.clamp(parseInt(color[2], 10) / 100, 0, 1),
                         C.clamp(parseInt(color[3], 10) / 100, 0, 1));

      r = color[0];
      g = color[1];
      b = color[2];

    } else if (C.PARSE_HSLA.test(color)) {
      color = color.match(C.PARSE_HSLA);

      a = parseFloat(color[4], 10);

      color = C.hslToRGB(((parseInt(color[1], 10) % 360 + 360) % 360) / 360,
                         C.clamp(parseInt(color[2], 10) / 100, 0, 1),
                         C.clamp(parseInt(color[3], 10) / 100, 0, 1));

      r = color[0];
      g = color[1];
      b = color[2];

    // See http://www.w3.org/TR/css3-color/#transparent-def
    } else if (color === "transparent") {
      r = g = b = 0;
      a = 0;

    } else if (color != null) {
      return NO;
    }

    return SC.Color.create({
      original: oColor,
      r: C.clampInt(r, 0, 255),
      g: C.clampInt(g, 0, 255),
      b: C.clampInt(b, 0, 255),
      a: C.clamp(a, 0, 1)
    }).freeze();
  }
});
