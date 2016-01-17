/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*******************!*\
  !*** ./gauges.js ***!
  \*******************/
/***/ function(module, exports, __webpack_require__) {

	steelseries = __webpack_require__(/*! ./lib/steelseries.js */ 1);
	simplegauges = __webpack_require__(/*! ./lib/simplegauges.js */ 2);
	WebSocket = __webpack_require__(/*! ws */ 3);
	SignalK = __webpack_require__(/*! signalk-client */ 4);


/***/ },
/* 1 */
/*!****************************!*\
  !*** ./lib/steelseries.js ***!
  \****************************/
/***/ function(module, exports) {

	/*!
	 * Name          : steelseries.js
	 * Authors       : Gerrit Grunwald, Mark Crossley
	 * Last modified : 29.01.2014
	 * Revision      : 0.14.7
	 *
	 * Copyright (c) 2011, Gerrit Grunwald, Mark Crossley
	 * All rights reserved.
	 *
	 *  Redistribution and use in source and binary forms, with or without modification, are permitted
	 *  provided that the following conditions are met:
	 *
	 *  # Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	 *  # Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following
	 *    disclaimer in the documentation and/or other materials provided with the distribution.
	 *
	 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING,
	 *   BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
	 *   SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	 *   DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
	 *   INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
	 *   OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */
	/*globals Tween */
	/*jshint onevar:false,plusplus:false,nomen:false,bitwise:false*/
	'option strict';
	
	var steelseries = (function () {
	
	    // Constants
	    var HALF_PI     = Math.PI * 0.5,
	        TWO_PI      = Math.PI * 2,
	        PI          = Math.PI,
	        RAD_FACTOR  = Math.PI / 180,
	        DEG_FACTOR  = 180 / Math.PI,
	        doc         = document,
	        lcdFontName = 'LCDMono2Ultra,Arial,Verdana,sans-serif',
	        stdFontName = 'Arial,Verdana,sans-serif';
	
	    //*************************************   C O M P O N O N E N T S   ************************************************
	    var radial = function (canvas, parameters) {
	        parameters = parameters || {};
	        var gaugeType = (undefined === parameters.gaugeType ? steelseries.GaugeType.TYPE4 : parameters.gaugeType),
	            size = (undefined === parameters.size ? 0 : parameters.size),
	            minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
	            maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
	            niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
	            threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue: parameters.threshold),
	            thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
	            section = (undefined === parameters.section ? null : parameters.section),
	            area = (undefined === parameters.area ? null : parameters.area),
	            titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
	            unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            pointerType = (undefined === parameters.pointerType ? steelseries.PointerType.TYPE1 : parameters.pointerType),
	            pointerColor = (undefined === parameters.pointerColor ? steelseries.ColorDef.RED : parameters.pointerColor),
	            knobType = (undefined === parameters.knobType ? steelseries.KnobType.STANDARD_KNOB : parameters.knobType),
	            knobStyle = (undefined === parameters.knobStyle ? steelseries.KnobStyle.SILVER : parameters.knobStyle),
	            lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor),
	            lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
	            lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
	            digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
	            fractionalScaleDecimals = (undefined === parameters.fractionalScaleDecimals ? 1 : parameters.fractionalScaleDecimals),
	            ledColor = (undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor),
	            ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
	            userLedColor = (undefined === parameters.userLedColor ? steelseries.LedColor.GREEN_LED : parameters.userLedColor),
	            userLedVisible = (undefined === parameters.userLedVisible ? false : parameters.userLedVisible),
	            thresholdVisible = (undefined === parameters.thresholdVisible ? true : parameters.thresholdVisible),
	            minMeasuredValueVisible = (undefined === parameters.minMeasuredValueVisible ? false : parameters.minMeasuredValueVisible),
	            maxMeasuredValueVisible = (undefined === parameters.maxMeasuredValueVisible ? false : parameters.maxMeasuredValueVisible),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            labelNumberFormat = (undefined === parameters.labelNumberFormat ? steelseries.LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
	            playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
	            alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
	            customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
	            tickLabelOrientation = (undefined === parameters.tickLabelOrientation ? (gaugeType === steelseries.GaugeType.TYPE1 ? steelseries.TickLabelOrientation.TANGENT : steelseries.TickLabelOrientation.NORMAL) : parameters.tickLabelOrientation),
	            trendVisible = (undefined === parameters.trendVisible ? false : parameters.trendVisible),
	            trendColors = (undefined === parameters.trendColors ? [steelseries.LedColor.RED_LED, steelseries.LedColor.GREEN_LED, steelseries.LedColor.CYAN_LED] : parameters.trendColors),
	            useOdometer = (undefined === parameters.useOdometer ? false : parameters.useOdometer),
	            odometerParams = (undefined === parameters.odometerParams ? {} : parameters.odometerParams),
	            odometerUseValue = (undefined === parameters.odometerUseValue ? false : parameters.odometerUseValue),
	            fullScaleDeflectionTime = (undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime);
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (size === 0) {
	            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        // Create audio tag for alarm sound
	        var audioElement;
	        if (playAlarm && alarmSound !== false) {
	            audioElement = doc.createElement('audio');
	            audioElement.setAttribute('src', alarmSound);
	            audioElement.setAttribute('preload', 'auto');
	        }
	
	        var value = minValue;
	        var odoValue = minValue;
	        var self = this;
	
	        // Properties
	        var minMeasuredValue = maxValue;
	        var maxMeasuredValue = minValue;
	
	        var ledBlinking = false;
	        var userLedBlinking = false;
	
	        var ledTimerId = 0;
	        var userLedTimerId = 0;
	        var tween;
	        var repainting = false;
	
	        var trendIndicator = steelseries.TrendState.OFF;
	        var trendSize = size * 0.06;
	        var trendPosX = size * 0.29;
	        var trendPosY = size * 0.36;
	
	        // GaugeType specific private variables
	        var freeAreaAngle;
	        var rotationOffset;
	        var tickmarkOffset;
	        var angleRange;
	        var angleStep;
	
	        var angle = rotationOffset + (value - minValue) * angleStep;
	
	        var imageWidth = size;
	        var imageHeight = size;
	
	        var centerX = imageWidth / 2;
	        var centerY = imageHeight / 2;
	
	        // Misc
	        var ledSize = size * 0.093457;
	        var ledPosX = 0.6 * imageWidth;
	        var ledPosY = 0.4 * imageHeight;
	        var userLedPosX = gaugeType === steelseries.GaugeType.TYPE3 ? 0.6 * imageWidth : centerX - ledSize / 2;
	        var userLedPosY = gaugeType === steelseries.GaugeType.TYPE3 ? 0.72 * imageHeight : 0.75 * imageHeight;
	        var lcdFontHeight = Math.floor(imageWidth / 10);
	        var stdFont = lcdFontHeight + 'px ' + stdFontName;
	        var lcdFont = lcdFontHeight + 'px ' + lcdFontName;
	        var lcdHeight = imageHeight * 0.13;
	        var lcdWidth = imageWidth * 0.4;
	        var lcdPosX = (imageWidth - lcdWidth) / 2;
	        var lcdPosY = imageHeight * 0.57;
	        var odoPosX, odoPosY = imageHeight * 0.61;
	        var shadowOffset = imageWidth * 0.006;
	
	        // Constants
	        var initialized = false;
	
	        // Tickmark specific private variables
	        var niceMinValue = minValue;
	        var niceMaxValue = maxValue;
	        var niceRange = maxValue - minValue;
	        var range = niceMaxValue - niceMinValue;
	        var minorTickSpacing = 0;
	        var majorTickSpacing = 0;
	        var maxNoOfMinorTicks = 10;
	        var maxNoOfMajorTicks = 10;
	
	        // Method to calculate nice values for min, max and range for the tickmarks
	        var calculate = function calculate() {
	            if (niceScale) {
	                niceRange = calcNiceNumber(maxValue - minValue, false);
	                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
	                niceMinValue = Math.floor(minValue / majorTickSpacing) * majorTickSpacing;
	                niceMaxValue = Math.ceil(maxValue / majorTickSpacing) * majorTickSpacing;
	                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
	                minValue = niceMinValue;
	                maxValue = niceMaxValue;
	                range = maxValue - minValue;
	            } else {
	                niceRange = (maxValue - minValue);
	                niceMinValue = minValue;
	                niceMaxValue = maxValue;
	                range = niceRange;
	                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
	                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
	            }
	
	            switch (gaugeType.type) {
	            case 'type1':
	                freeAreaAngle = 0;
	                rotationOffset = PI;
	                tickmarkOffset = HALF_PI;
	                angleRange = HALF_PI;
	                angleStep = angleRange / range;
	                break;
	
	            case 'type2':
	                freeAreaAngle = 0;
	                rotationOffset = PI;
	                tickmarkOffset = HALF_PI;
	                angleRange = PI;
	                angleStep = angleRange / range;
	                break;
	
	            case 'type3':
	                freeAreaAngle = 0;
	                rotationOffset = HALF_PI;
	                tickmarkOffset = 0;
	                angleRange = 1.5 * PI;
	                angleStep = angleRange / range;
	                break;
	
	            case 'type4':
	            /* falls through */
	            default:
	                freeAreaAngle = 60 * RAD_FACTOR;
	                rotationOffset = HALF_PI + (freeAreaAngle / 2);
	                tickmarkOffset = 0;
	                angleRange = TWO_PI - freeAreaAngle;
	                angleStep = angleRange / range;
	                break;
	            }
	            angle = rotationOffset + (value - minValue) * angleStep;
	        };
	
	        // **************   Buffer creation  ********************
	        // Buffer for the frame
	        var frameBuffer = createBuffer(size, size);
	        var frameContext = frameBuffer.getContext('2d');
	
	        // Buffer for the background
	        var backgroundBuffer = createBuffer(size, size);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        var lcdBuffer;
	
	        // Buffer for led on painting code
	        var ledBufferOn = createBuffer(ledSize, ledSize);
	        var ledContextOn = ledBufferOn.getContext('2d');
	
	        // Buffer for led off painting code
	        var ledBufferOff = createBuffer(ledSize, ledSize);
	        var ledContextOff = ledBufferOff.getContext('2d');
	
	        // Buffer for current led painting code
	        var ledBuffer = ledBufferOff;
	
	        // Buffer for user led on painting code
	        var userLedBufferOn = createBuffer(ledSize, ledSize);
	        var userLedContextOn = userLedBufferOn.getContext('2d');
	
	        // Buffer for user led off painting code
	        var userLedBufferOff = createBuffer(ledSize, ledSize);
	        var userLedContextOff = userLedBufferOff.getContext('2d');
	
	        // Buffer for current user led painting code
	        var userLedBuffer = userLedBufferOff;
	
	        // Buffer for the minMeasuredValue indicator
	        var minMeasuredValueBuffer = createBuffer(Math.ceil(size * 0.028037), Math.ceil(size * 0.028037));
	        var minMeasuredValueCtx = minMeasuredValueBuffer.getContext('2d');
	
	        // Buffer for the maxMeasuredValue indicator
	        var maxMeasuredValueBuffer = createBuffer(Math.ceil(size * 0.028037), Math.ceil(size * 0.028037));
	        var maxMeasuredValueCtx = maxMeasuredValueBuffer.getContext('2d');
	
	        // Buffer for pointer image painting code
	        var pointerBuffer = createBuffer(size, size);
	        var pointerContext = pointerBuffer.getContext('2d');
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(size, size);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        // Buffers for trend indicators
	        var trendUpBuffer, trendSteadyBuffer, trendDownBuffer, trendOffBuffer;
	
	        // Buffer for odometer
	        var odoGauge, odoBuffer, odoContext;
	        if (useOdometer && lcdVisible) {
	            odoBuffer = createBuffer(10, 10);          // size doesn't matter, it will get reset by odometer code
	            odoContext = odoBuffer.getContext('2d');
	        }
	
	        // **************   Image creation  ********************
	        var drawLcdText = function (ctx, value) {
	            ctx.restore();
	            ctx.save();
	            ctx.textAlign = 'right';
	            ctx.strokeStyle = lcdColor.textColor;
	            ctx.fillStyle = lcdColor.textColor;
	
	            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
	                ctx.shadowColor = 'gray';
	                ctx.shadowOffsetX = imageWidth * 0.007;
	                ctx.shadowOffsetY = imageWidth * 0.007;
	                ctx.shadowBlur = imageWidth * 0.007;
	            }
	            if (digitalFont) {
	                ctx.font = lcdFont;
	            } else {
	                ctx.font = stdFont;
	            }
	            ctx.fillText(value.toFixed(lcdDecimals), lcdPosX + lcdWidth - lcdWidth * 0.05, lcdPosY + lcdHeight * 0.5 + lcdFontHeight * 0.38, lcdWidth * 0.9);
	
	            ctx.restore();
	        };
	
	        var drawPostsImage = function (ctx) {
	            ctx.save();
	
	            if ('type1' === gaugeType.type) {
	                // Draw max center top post
	                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.523364, imageHeight * 0.130841);
	            }
	
	            if ('type1' === gaugeType.type || 'type2' === gaugeType.type) {
	                // Draw min left post
	                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.130841, imageHeight * 0.514018);
	            }
	
	            if ('type2' === gaugeType.type || 'type3' === gaugeType.type) {
	                // Draw max right post
	                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.831775, imageHeight * 0.514018);
	            }
	
	            if ('type3' === gaugeType.type) {
	                // Draw min center bottom post
	                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.523364, imageHeight * 0.831775);
	            }
	
	            if ('type4' === gaugeType.type) {
	                // Min post
	                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.336448, imageHeight * 0.803738);
	
	                // Max post
	                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.626168, imageHeight * 0.803738);
	            }
	
	            ctx.restore();
	
	        };
	
	        var createThresholdImage = function () {
	            var thresholdBuffer = doc.createElement('canvas');
	            thresholdBuffer.width = Math.ceil(size * 0.046728);
	            thresholdBuffer.height = Math.ceil(thresholdBuffer.width * 0.9);
	            var thresholdCtx = thresholdBuffer.getContext('2d');
	
	            thresholdCtx.save();
	            var gradThreshold = thresholdCtx.createLinearGradient(0, 0.1, 0, thresholdBuffer.height * 0.9);
	            gradThreshold.addColorStop(0, '#520000');
	            gradThreshold.addColorStop(0.3, '#fc1d00');
	            gradThreshold.addColorStop(0.59, '#fc1d00');
	            gradThreshold.addColorStop(1, '#520000');
	            thresholdCtx.fillStyle = gradThreshold;
	
	            thresholdCtx.beginPath();
	            thresholdCtx.moveTo(thresholdBuffer.width * 0.5, 0.1);
	            thresholdCtx.lineTo(thresholdBuffer.width * 0.9, thresholdBuffer.height * 0.9);
	            thresholdCtx.lineTo(thresholdBuffer.width * 0.1, thresholdBuffer.height * 0.9);
	            thresholdCtx.lineTo(thresholdBuffer.width * 0.5, 0.1);
	            thresholdCtx.closePath();
	
	            thresholdCtx.fill();
	            thresholdCtx.strokeStyle = '#FFFFFF';
	            thresholdCtx.stroke();
	
	            thresholdCtx.restore();
	
	            return thresholdBuffer;
	        };
	
	        var drawAreaSectionImage = function (ctx, start, stop, color, filled) {
	            if (start < minValue) {
	                start = minValue;
	            } else if (start > maxValue) {
	                start = maxValue;
	            }
	            if (stop < minValue) {
	                stop = minValue;
	            } else if (stop > maxValue) {
	                stop = maxValue;
	            }
	            if (start >= stop) {
	                return;
	            }
	            ctx.save();
	            ctx.strokeStyle = color;
	            ctx.fillStyle = color;
	            ctx.lineWidth = imageWidth * 0.035;
	            var startAngle = (angleRange / range * start - angleRange / range * minValue);
	            var stopAngle = startAngle + (stop - start) / (range / angleRange);
	            ctx.translate(centerX, centerY);
	            ctx.rotate(rotationOffset);
	            ctx.beginPath();
	            if (filled) {
	                ctx.moveTo(0, 0);
	                ctx.arc(0, 0, imageWidth * 0.365 - ctx.lineWidth / 2, startAngle, stopAngle, false);
	            } else {
	                ctx.arc(0, 0, imageWidth * 0.365, startAngle, stopAngle, false);
	            }
	            if (filled) {
	                ctx.moveTo(0, 0);
	                ctx.fill();
	            } else {
	                ctx.stroke();
	            }
	
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        var drawTickmarksImage = function (ctx, labelNumberFormat) {
	            var fontSize = Math.ceil(imageWidth * 0.04),
	                alpha = rotationOffset,      // Tracks total rotation
	                rotationStep = angleStep * minorTickSpacing,
	                textRotationAngle,
	                valueCounter = minValue,
	                majorTickCounter = maxNoOfMinorTicks - 1,
	                OUTER_POINT = imageWidth * 0.38,
	                MAJOR_INNER_POINT = imageWidth * 0.35,
	                MED_INNER_POINT = imageWidth * 0.355,
	                MINOR_INNER_POINT = imageWidth * 0.36,
	                TEXT_TRANSLATE_X = imageWidth * 0.3,
	                TEXT_WIDTH = imageWidth * 0.1,
	                HALF_MAX_NO_OF_MINOR_TICKS = maxNoOfMinorTicks / 2,
	                MAX_VALUE_ROUNDED = parseFloat(maxValue.toFixed(2)),
	                i;
	
	            backgroundColor.labelColor.setAlpha(1);
	            ctx.save();
	            ctx.textAlign = 'center';
	            ctx.textBaseline = 'middle';
	            ctx.font = fontSize + 'px' + stdFontName;
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.translate(centerX, centerY);
	            ctx.rotate(rotationOffset);
	
	            if (gaugeType.type === 'type1' || gaugeType.type === 'type2') {
	                TEXT_WIDTH = imageWidth * 0.04;
	            }
	
	            for (i = minValue; parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED; i += minorTickSpacing) {
	                textRotationAngle = rotationStep + HALF_PI;
	                majorTickCounter++;
	                // Draw major tickmarks
	                if (majorTickCounter === maxNoOfMinorTicks) {
	                    ctx.lineWidth = 1.5;
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(MAJOR_INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                    ctx.save();
	                    ctx.translate(TEXT_TRANSLATE_X, 0);
	
	                    switch (tickLabelOrientation.type) {
	                    case 'horizontal':
	                        textRotationAngle = -alpha;
	                        break;
	
	                    case 'tangent':
	                        textRotationAngle = (alpha <= HALF_PI + PI ? PI : 0);
	                        break;
	
	                    case 'normal':
	                    /* falls through */
	                    default:
	                        textRotationAngle = HALF_PI;
	                        break;
	                    }
	                    ctx.rotate(textRotationAngle);
	
	                    switch (labelNumberFormat.format) {
	                    case 'fractional':
	                        ctx.fillText((valueCounter.toFixed(fractionalScaleDecimals)), 0, 0, TEXT_WIDTH);
	                        break;
	
	                    case 'scientific':
	                        ctx.fillText((valueCounter.toPrecision(2)), 0, 0, TEXT_WIDTH);
	                        break;
	
	                    case 'standard':
	                    /* falls through */
	                    default:
	                        ctx.fillText((valueCounter.toFixed(0)), 0, 0, TEXT_WIDTH);
	                        break;
	                    }
	                    ctx.translate(-TEXT_TRANSLATE_X, 0);
	                    ctx.restore();
	
	                    valueCounter += majorTickSpacing;
	                    majorTickCounter = 0;
	                    ctx.rotate(rotationStep);
	                    alpha += rotationStep;
	                    continue;
	                }
	
	                // Draw tickmark every minor tickmark spacing
	                if (0 === maxNoOfMinorTicks % 2 && majorTickCounter === (HALF_MAX_NO_OF_MINOR_TICKS)) {
	                    ctx.lineWidth = 1;
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(MED_INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                } else {
	                    ctx.lineWidth = 0.5;
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(MINOR_INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                }
	                ctx.rotate(rotationStep);
	                alpha += rotationStep;
	            }
	
	            /*
	             // Logarithmic scale
	             var tmp = 0.1;
	             var minValueLog10 = 0.1;
	             var maxValueLog10 = parseInt(Math.pow(10, Math.ceil(Math.log10(maxValue))));
	             var drawLabel = true;
	             angleStep = angleRange / (maxValueLog10 - minValueLog10)
	             for (var scaleFactor = minValueLog10 ; scaleFactor <= maxValueLog10 ; scaleFactor *= 10)
	             {
	             for (var i = parseFloat((1 * scaleFactor).toFixed(1)) ; i < parseFloat((10 * scaleFactor).toFixed(1)) ; i += scaleFactor)
	             {
	             textRotationAngle =+ rotationStep + HALF_PI;
	
	             if(drawLabel)
	             {
	             ctx.lineWidth = 1.5;
	             ctx.beginPath();
	             ctx.moveTo(imageWidth * 0.38,0);
	             ctx.lineTo(imageWidth * 0.35,0);
	             ctx.closePath();
	             ctx.stroke();
	             ctx.save();
	             ctx.translate(imageWidth * 0.31, 0);
	             ctx.rotate(textRotationAngle);
	             ctx.fillText(parseFloat((i).toFixed(1)), 0, 0, imageWidth * 0.0375);
	             ctx.translate(-imageWidth * 0.31, 0);
	             ctx.restore();
	             drawLabel = false;
	             }
	             else
	             {
	             ctx.lineWidth = 0.5;
	             ctx.beginPath();
	             ctx.moveTo(imageWidth * 0.38,0);
	             ctx.lineTo(imageWidth * 0.36,0);
	             ctx.closePath();
	             ctx.stroke();
	             }
	             //doc.write('log10 scale value: ' + parseFloat((i).toFixed(1)) + '<br>');
	             //Math.log10(parseFloat((i).toFixed(1)));
	
	             ctx.rotate(rotationStep);
	             }
	             tmp = 0.1;
	             drawLabel = true;
	             }
	             */
	
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        // **************   Initialization  ********************
	        // Draw all static painting code to background
	        var init = function (parameters) {
	            parameters = parameters || {};
	            var drawFrame = (undefined === parameters.frame ? false : parameters.frame);
	            var drawBackground = (undefined === parameters.background ? false : parameters.background);
	            var drawLed = (undefined === parameters.led ? false : parameters.led);
	            var drawUserLed = (undefined === parameters.userLed ? false : parameters.userLed);
	            var drawPointer = (undefined === parameters.pointer ? false : parameters.pointer);
	            var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
	            var drawTrend = (undefined === parameters.trend ? false : parameters.trend);
	            var drawOdo = (undefined === parameters.odo ? false : parameters.odo);
	
	            initialized = true;
	
	            // Calculate the current min and max values and the range
	            calculate();
	
	            // Create frame in frame buffer (backgroundBuffer)
	            if (drawFrame && frameVisible) {
	                drawRadialFrameImage(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            // Create background in background buffer (backgroundBuffer)
	            if (drawBackground && backgroundVisible) {
	                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
	
	                // Create custom layer in background buffer (backgroundBuffer)
	                drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            if (drawLed) {
	                // Draw LED ON in ledBuffer_ON
	                ledContextOn.drawImage(createLedImage(Math.ceil(size * 0.093457), 1, ledColor), 0, 0);
	
	                // Draw LED OFF in ledBuffer_OFF
	                ledContextOff.drawImage(createLedImage(Math.ceil(size * 0.093457), 0, ledColor), 0, 0);
	            }
	
	            if (drawUserLed) {
	                // Draw user LED ON in userLedBuffer_ON
	                userLedContextOn.drawImage(createLedImage(Math.ceil(size * 0.093457), 1, userLedColor), 0, 0);
	
	                // Draw user LED OFF in userLedBuffer_OFF
	                userLedContextOff.drawImage(createLedImage(Math.ceil(size * 0.093457), 0, userLedColor), 0, 0);
	            }
	
	            // Draw min measured value indicator in minMeasuredValueBuffer
	            if (minMeasuredValueVisible) {
	                minMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * 0.028037), steelseries.ColorDef.BLUE.dark.getRgbaColor(), true, true), 0, 0);
	            }
	
	            // Draw max measured value indicator in maxMeasuredValueBuffer
	            if (maxMeasuredValueVisible) {
	                maxMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * 0.028037), steelseries.ColorDef.RED.medium.getRgbaColor(), true), 0, 0);
	            }
	
	            // Create alignment posts in background buffer (backgroundBuffer)
	            if (drawBackground && backgroundVisible) {
	                drawPostsImage(backgroundContext);
	
	                // Create section in background buffer (backgroundBuffer)
	                if (null !== section && 0 < section.length) {
	                    var sectionIndex = section.length;
	                    do {
	                        sectionIndex--;
	                        drawAreaSectionImage(backgroundContext, section[sectionIndex].start, section[sectionIndex].stop, section[sectionIndex].color, false);
	                    }
	                    while (0 < sectionIndex);
	                }
	
	                // Create area in background buffer (backgroundBuffer)
	                if (null !== area && 0 < area.length) {
	                    var areaIndex = area.length;
	                    do {
	                        areaIndex--;
	                        drawAreaSectionImage(backgroundContext, area[areaIndex].start, area[areaIndex].stop, area[areaIndex].color, true);
	                    }
	                    while (0 < areaIndex);
	                }
	
	                // Create tickmarks in background buffer (backgroundBuffer)
	                drawTickmarksImage(backgroundContext, labelNumberFormat);
	
	                // Create title in background buffer (backgroundBuffer)
	                drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, true, true);
	            }
	
	            // Draw threshold image to background context
	            if (drawBackground && thresholdVisible) {
	                backgroundContext.save();
	                backgroundContext.translate(centerX, centerY);
	                backgroundContext.rotate(rotationOffset + (threshold - minValue) * angleStep + HALF_PI);
	                backgroundContext.translate(-centerX, -centerY);
	                backgroundContext.drawImage(createThresholdImage(), imageWidth * 0.475, imageHeight * 0.13);
	                backgroundContext.translate(centerX, centerY);
	                backgroundContext.restore();
	            }
	
	            // Create lcd background if selected in background buffer (backgroundBuffer)
	            if (drawBackground && lcdVisible) {
	                if (useOdometer && drawOdo) {
	                    odoGauge = new steelseries.Odometer('', {
	                            _context: odoContext,
	                            height: size * 0.075,
	                            decimals: odometerParams.decimals,
	                            digits: (odometerParams.digits === undefined ? 5 : odometerParams.digits),
	                            valueForeColor: odometerParams.valueForeColor,
	                            valueBackColor: odometerParams.valueBackColor,
	                            decimalForeColor: odometerParams.decimalForeColor,
	                            decimalBackColor: odometerParams.decimalBackColor,
	                            font: odometerParams.font,
	                            value: value
	                        });
	                    odoPosX = (imageWidth - odoBuffer.width) / 2;
	                } else if (!useOdometer) {
	                    lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor);
	                    backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY);
	                }
	            }
	
	            // Create pointer image in pointer buffer (contentBuffer)
	            if (drawPointer) {
	                drawPointerImage(pointerContext, imageWidth, pointerType, pointerColor, backgroundColor.labelColor);
	            }
	
	            // Create foreground in foreground buffer (foregroundBuffer)
	            if (drawForeground && foregroundVisible) {
	                var knobVisible = (pointerType.type === 'type15' || pointerType.type === 'type16' ? false : true);
	                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, knobVisible, knobType, knobStyle, gaugeType);
	            }
	
	            // Create the trend indicator buffers
	            if (drawTrend && trendVisible) {
	                trendUpBuffer = createTrendIndicator(trendSize, steelseries.TrendState.UP, trendColors);
	                trendSteadyBuffer = createTrendIndicator(trendSize, steelseries.TrendState.STEADY, trendColors);
	                trendDownBuffer = createTrendIndicator(trendSize, steelseries.TrendState.DOWN, trendColors);
	                trendOffBuffer = createTrendIndicator(trendSize, steelseries.TrendState.OFF, trendColors);
	            }
	        };
	
	        var resetBuffers = function (buffers) {
	            buffers = buffers || {};
	            var resetFrame = (undefined === buffers.frame ? false : buffers.frame);
	            var resetBackground = (undefined === buffers.background ? false : buffers.background);
	            var resetLed = (undefined === buffers.led ? false : buffers.led);
	            var resetUserLed = (undefined === buffers.userLed ? false : buffers.userLed);
	            var resetPointer = (undefined === buffers.pointer ? false : buffers.pointer);
	            var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);
	
	            if (resetFrame) {
	                frameBuffer.width = size;
	                frameBuffer.height = size;
	                frameContext = frameBuffer.getContext('2d');
	            }
	
	            if (resetBackground) {
	                backgroundBuffer.width = size;
	                backgroundBuffer.height = size;
	                backgroundContext = backgroundBuffer.getContext('2d');
	            }
	
	            if (resetLed) {
	                ledBufferOn.width = Math.ceil(size * 0.093457);
	                ledBufferOn.height = Math.ceil(size * 0.093457);
	                ledContextOn = ledBufferOn.getContext('2d');
	
	                ledBufferOff.width = Math.ceil(size * 0.093457);
	                ledBufferOff.height = Math.ceil(size * 0.093457);
	                ledContextOff = ledBufferOff.getContext('2d');
	
	                // Buffer for current led painting code
	                ledBuffer = ledBufferOff;
	            }
	
	            if (resetUserLed) {
	                userLedBufferOn.width = Math.ceil(size * 0.093457);
	                userLedBufferOn.height = Math.ceil(size * 0.093457);
	                userLedContextOn = userLedBufferOn.getContext('2d');
	
	                userLedBufferOff.width = Math.ceil(size * 0.093457);
	                userLedBufferOff.height = Math.ceil(size * 0.093457);
	                userLedContextOff = userLedBufferOff.getContext('2d');
	
	                // Buffer for current user led painting code
	                userLedBuffer = userLedBufferOff;
	            }
	
	            if (resetPointer) {
	                pointerBuffer.width = size;
	                pointerBuffer.height = size;
	                pointerContext = pointerBuffer.getContext('2d');
	            }
	
	            if (resetForeground) {
	                foregroundBuffer.width = size;
	                foregroundBuffer.height = size;
	                foregroundContext = foregroundBuffer.getContext('2d');
	            }
	        };
	
	        var toggleAndRepaintLed = function () {
	            if (ledVisible) {
	                if (ledBuffer === ledBufferOn) {
	                    ledBuffer = ledBufferOff;
	                } else {
	                    ledBuffer = ledBufferOn;
	                }
	                if (!repainting) {
	                    repainting = true;
	                    requestAnimFrame(self.repaint);
	                }
	            }
	        };
	
	        var toggleAndRepaintUserLed = function () {
	            if (userLedVisible) {
	                if (userLedBuffer === userLedBufferOn) {
	                    userLedBuffer = userLedBufferOff;
	                } else {
	                    userLedBuffer = userLedBufferOn;
	                }
	                if (!repainting) {
	                    repainting = true;
	                    requestAnimFrame(self.repaint);
	                }
	            }
	        };
	
	        var blink = function (blinking) {
	            if (blinking) {
	                ledTimerId = setInterval(toggleAndRepaintLed, 1000);
	            } else {
	                clearInterval(ledTimerId);
	                ledBuffer = ledBufferOff;
	            }
	        };
	
	        var blinkUser = function (blinking) {
	            if (blinking) {
	                userLedTimerId = setInterval(toggleAndRepaintUserLed, 1000);
	            } else {
	                clearInterval(userLedTimerId);
	                userLedBuffer = userLedBufferOff;
	            }
	        };
	
	        //************************************ Public methods **************************************
	        this.setValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue);
	            if (value !== targetValue) {
	                value = targetValue;
	
	                if (value > maxMeasuredValue) {
	                    maxMeasuredValue = value;
	                }
	                if (value < minMeasuredValue) {
	                    minMeasuredValue = value;
	                }
	
	                if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                    (value <= threshold && !ledBlinking && !thresholdRising)) {
	                    ledBlinking = true;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.play();
	                    }
	                } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                           (value > threshold && ledBlinking && !thresholdRising)) {
	                    ledBlinking = false;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.pause();
	                    }
	                }
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.setOdoValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < 0 ? 0 : newValue);
	            if (odoValue !== targetValue) {
	                odoValue = targetValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getOdoValue = function () {
	            return odoValue;
	        };
	
	        this.setValueAnimated = function (newValue, callback) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue)),
	                gauge = this,
	                time;
	
	            if (value !== targetValue) {
	                if (undefined !== tween && tween.isPlaying) {
	                    tween.stop();
	                }
	                time = fullScaleDeflectionTime * Math.abs(targetValue - value) / (maxValue - minValue);
	                time = Math.max(time, fullScaleDeflectionTime / 5);
	                tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, time);
	                //tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, 1);
	                //tween = new Tween(new Object(), '', Tween.strongEaseInOut, value, targetValue, 1);
	
	                tween.onMotionChanged = function (event) {
	                    value = event.target._pos;
	
	                    if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                        (value <= threshold && !ledBlinking && !thresholdRising)) {
	                        ledBlinking = true;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.play();
	                        }
	                    } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                               (value > threshold && ledBlinking && !thresholdRising)) {
	                        ledBlinking = false;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.pause();
	                        }
	                    }
	
	                    if (value > maxMeasuredValue) {
	                        maxMeasuredValue = value;
	                    }
	                    if (value < minMeasuredValue) {
	                        minMeasuredValue = value;
	                    }
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tween.onMotionFinished = callback;
	                }
	
	                tween.start();
	            }
	            return this;
	        };
	
	        this.resetMinMeasuredValue = function () {
	            minMeasuredValue = value;
	            this.repaint();
	        };
	
	        this.resetMaxMeasuredValue = function () {
	            maxMeasuredValue = value;
	            this.repaint();
	            return this;
	        };
	
	        this.setMinMeasuredValueVisible = function (visible) {
	            minMeasuredValueVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setMaxMeasuredValueVisible = function (visible) {
	            maxMeasuredValueVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setMaxMeasuredValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue);
	            maxMeasuredValue = targetValue;
	            this.repaint();
	            return this;
	        };
	
	        this.setMinMeasuredValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue);
	            minMeasuredValue = targetValue;
	            this.repaint();
	            return this;
	        };
	
	        this.setTitleString = function (title) {
	            titleString = title;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setUnitString = function (unit) {
	            unitString = unit;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setMinValue = function (value) {
	            minValue = parseFloat(value);
	            resetBuffers({frame: true,
	                          background: true});
	            init({frame: true,
	                  background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.getMinValue = function () {
	            return minValue;
	        };
	
	        this.setMaxValue = function (value) {
	            maxValue = parseFloat(value);
	            resetBuffers({frame: true,
	                          background: true});
	            init({frame: true,
	                  background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.getMaxValue = function () {
	            return maxValue;
	        };
	
	        this.setThreshold = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue);
	            threshold = targetValue;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setArea = function (areaVal) {
	            area = areaVal;
	            resetBuffers({background: true,
	                          foreground: true});
	            init({background: true,
	                  foreground: true
	                  });
	            this.repaint();
	            return this;
	        };
	
	        this.setSection = function (areaSec) {
	            section = areaSec;
	            resetBuffers({background: true,
	                          foreground: true});
	            init({background: true,
	                  foreground: true
	                  });
	            this.repaint();
	            return this;
	        };
	
	        this.setThresholdVisible = function (visible) {
	            thresholdVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setThresholdRising = function (rising) {
	            thresholdRising = !!rising;
	            // reset existing threshold alerts
	            ledBlinking = !ledBlinking;
	            blink(ledBlinking);
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdDecimals = function (decimals) {
	            lcdDecimals = parseInt(decimals, 10);
	            this.repaint();
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers({frame: true});
	            frameDesign = newFrameDesign;
	            init({frame: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers({background: true,
	                          pointer: (pointerType.type === 'type2' || pointerType.type === 'type13' ? true : false)       // type2 & 13 depend on background
	                });
	            backgroundColor = newBackgroundColor;
	            init({background: true,   // type2 & 13 depend on background
	                  pointer: (pointerType.type === 'type2' || pointerType.type === 'type13' ? true : false)
	                });
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers({foreground: true});
	            foregroundType = newForegroundType;
	            init({foreground: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerType = function (newPointerType) {
	            resetBuffers({pointer: true,
	                          foreground: true
	                         });
	            pointerType = newPointerType;
	            init({pointer: true,
	                  foreground: true
	                  });
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerColor = function (newPointerColor) {
	            resetBuffers({pointer: true});
	            pointerColor = newPointerColor;
	            init({pointer: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLedColor = function (newLedColor) {
	            resetBuffers({led: true});
	            ledColor = newLedColor;
	            init({led: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setUserLedColor = function (newLedColor) {
	            resetBuffers({userLed: true});
	            userLedColor = newLedColor;
	            init({userLed: true});
	            this.repaint();
	            return this;
	        };
	
	        this.toggleUserLed = function () {
	            if (userLedBuffer === userLedBufferOn) {
	                userLedBuffer = userLedBufferOff;
	            } else {
	                userLedBuffer = userLedBufferOn;
	            }
	            this.repaint();
	            return this;
	        };
	
	        this.setUserLedOnOff = function (on) {
	            if (true === on) {
	                userLedBuffer = userLedBufferOn;
	            } else {
	                userLedBuffer = userLedBufferOff;
	            }
	            this.repaint();
	            return this;
	        };
	
	        this.blinkUserLed = function (blink) {
	            if (blink) {
	                if (!userLedBlinking) {
	                    blinkUser(true);
	                    userLedBlinking = true;
	                }
	            } else {
	                if (userLedBlinking) {
	                    clearInterval(userLedTimerId);
	                    userLedBlinking = false;
	                }
	            }
	            return this;
	        };
	
	        this.setLedVisible = function (visible) {
	            ledVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setUserLedVisible = function (visible) {
	            userLedVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdColor = function (newLcdColor) {
	            lcdColor = newLcdColor;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setTrend = function (newValue) {
	            trendIndicator = newValue;
	            this.repaint();
	            return this;
	        };
	
	        this.setTrendVisible = function (visible) {
	            trendVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setFractionalScaleDecimals = function (decimals) {
	            fractionalScaleDecimals = parseInt(decimals, 10);
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLabelNumberFormat = function (format) {
	            labelNumberFormat = format;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init({frame: true,
	                      background: true,
	                      led: true,
	                      userLed: true,
	                      pointer: true,
	                      trend: true,
	                      foreground: true,
	                      odo: true});
	            }
	            mainCtx.clearRect(0, 0, size, size);
	
	            // Draw frame
	            if (frameVisible) {
	                mainCtx.drawImage(frameBuffer, 0, 0);
	            }
	
	            // Draw buffered image to visible canvas
	            mainCtx.drawImage(backgroundBuffer, 0, 0);
	
	            // Draw lcd display
	            if (lcdVisible) {
	                if (useOdometer) {
	                    odoGauge.setValue(odometerUseValue ? value : odoValue);
	                    mainCtx.drawImage(odoBuffer, odoPosX, odoPosY);
	                } else {
	                    drawLcdText(mainCtx, value);
	                }
	            }
	
	            // Draw led
	            if (ledVisible) {
	                mainCtx.drawImage(ledBuffer, ledPosX, ledPosY);
	            }
	
	            // Draw user led
	            if (userLedVisible) {
	                mainCtx.drawImage(userLedBuffer, userLedPosX, userLedPosY);
	            }
	
	            // Draw the trend indicator
	            if (trendVisible) {
	                switch (trendIndicator.state) {
	                case 'up':
	                    mainCtx.drawImage(trendUpBuffer, trendPosX, trendPosY);
	                    break;
	                case 'steady':
	                    mainCtx.drawImage(trendSteadyBuffer, trendPosX, trendPosY);
	                    break;
	                case 'down':
	                    mainCtx.drawImage(trendDownBuffer, trendPosX, trendPosY);
	                    break;
	                case 'off':
	                    mainCtx.drawImage(trendOffBuffer, trendPosX, trendPosY);
	                    break;
	                }
	            }
	
	            // Draw min measured value indicator
	            if (minMeasuredValueVisible) {
	                mainCtx.save();
	                mainCtx.translate(centerX, centerY);
	                mainCtx.rotate(rotationOffset + HALF_PI + (minMeasuredValue - minValue) * angleStep);
	                mainCtx.translate(-centerX, -centerY);
	                mainCtx.drawImage(minMeasuredValueBuffer, mainCtx.canvas.width * 0.4865, mainCtx.canvas.height * 0.105);
	                mainCtx.restore();
	            }
	
	            // Draw max measured value indicator
	            if (maxMeasuredValueVisible) {
	                mainCtx.save();
	                mainCtx.translate(centerX, centerY);
	                mainCtx.rotate(rotationOffset + HALF_PI + (maxMeasuredValue - minValue) * angleStep);
	                mainCtx.translate(-centerX, -centerY);
	                mainCtx.drawImage(maxMeasuredValueBuffer, mainCtx.canvas.width * 0.4865, mainCtx.canvas.height * 0.105);
	                mainCtx.restore();
	            }
	
	            angle = rotationOffset + HALF_PI + (value - minValue) * angleStep;
	
	            // Define rotation center
	            mainCtx.save();
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(angle);
	            mainCtx.translate(-centerX, -centerY);
	            // Set the pointer shadow params
	            mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
	            mainCtx.shadowBlur = shadowOffset * 2;
	            // Draw the pointer
	            mainCtx.drawImage(pointerBuffer, 0, 0);
	            // Undo the translations & shadow settings
	            mainCtx.restore();
	
	            // Draw foreground
	            if (foregroundVisible) {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var radialBargraph = function (canvas, parameters) {
	        parameters = parameters || {};
	        var gaugeType = (undefined === parameters.gaugeType ? steelseries.GaugeType.TYPE4 : parameters.gaugeType),
	            size = (undefined === parameters.size ? 0 : parameters.size),
	            minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
	            maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
	            niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
	            threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue: parameters.threshold),
	            thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
	            section = (undefined === parameters.section ? null : parameters.section),
	            useSectionColors = (undefined === parameters.useSectionColors ? false : parameters.useSectionColors),
	            titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
	            unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            valueColor = (undefined === parameters.valueColor ? steelseries.ColorDef.RED : parameters.valueColor),
	            lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor),
	            lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
	            lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
	            digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
	            fractionalScaleDecimals = (undefined === parameters.fractionalScaleDecimals ? 1 : parameters.fractionalScaleDecimals),
	            customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
	            ledColor = (undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor),
	            ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
	            userLedColor = (undefined === parameters.userLedColor ? steelseries.LedColor.GREEN_LED : parameters.userLedColor),
	            userLedVisible = (undefined === parameters.userLedVisible ? false : parameters.userLedVisible),
	            labelNumberFormat = (undefined === parameters.labelNumberFormat ? steelseries.LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
	            alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
	            valueGradient = (undefined === parameters.valueGradient ? null : parameters.valueGradient),
	            useValueGradient = (undefined === parameters.useValueGradient ? false : parameters.useValueGradient),
	            tickLabelOrientation = (undefined === parameters.tickLabelOrientation ? (gaugeType === steelseries.GaugeType.TYPE1 ? steelseries.TickLabelOrientation.TANGENT : steelseries.TickLabelOrientation.NORMAL) : parameters.tickLabelOrientation),
	            trendVisible = (undefined === parameters.trendVisible ? false : parameters.trendVisible),
	            trendColors = (undefined === parameters.trendColors ? [steelseries.LedColor.RED_LED, steelseries.LedColor.GREEN_LED, steelseries.LedColor.CYAN_LED] : parameters.trendColors),
	            fullScaleDeflectionTime = (undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime);
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (size === 0) {
	            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        // Create audio tag for alarm sound
	        if (playAlarm && alarmSound !== false) {
	            var audioElement = doc.createElement('audio');
	            audioElement.setAttribute('src', alarmSound);
	            audioElement.setAttribute('preload', 'auto');
	        }
	
	        var value = minValue;
	        var range = maxValue - minValue;
	        var ledBlinking = false;
	        var ledTimerId = 0;
	        var userLedBlinking = false;
	        var userLedTimerId = 0;
	        var tween;
	        var self = this;
	        var repainting = false;
	
	        // GaugeType specific private variables
	        var freeAreaAngle;
	        var rotationOffset;
	        var bargraphOffset;
	        var tickmarkOffset;
	        var angleRange;
	        var degAngleRange;
	        var angleStep;
	        var angle;
	
	        var sectionAngles = [];
	        var isSectionsVisible = false;
	        var isGradientVisible = false;
	
	        var imageWidth = size;
	        var imageHeight = size;
	
	        var centerX = imageWidth / 2;
	        var centerY = imageHeight / 2;
	
	        // Misc
	        var lcdFontHeight = Math.floor(imageWidth / 10);
	        var stdFont = lcdFontHeight + 'px ' + stdFontName;
	        var lcdFont = lcdFontHeight + 'px ' + lcdFontName;
	        var lcdHeight = imageHeight * 0.13;
	        var lcdWidth = imageWidth * 0.4;
	        var lcdPosX = (imageWidth - lcdWidth) / 2;
	        var lcdPosY = imageHeight / 2 - lcdHeight / 2;
	
	        // Constants
	        var ACTIVE_LED_POS_X = imageWidth * 0.116822;
	        var ACTIVE_LED_POS_Y = imageWidth * 0.485981;
	        var LED_SIZE = Math.ceil(size * 0.093457);
	        //var LED_POS_X = imageWidth * 0.453271;
	        var LED_POS_X = imageWidth * 0.53;
	        var LED_POS_Y = imageHeight * 0.61;
	        var USER_LED_POS_X = gaugeType === steelseries.GaugeType.TYPE3 ? 0.7 * imageWidth : centerX - LED_SIZE / 2;
	        var USER_LED_POS_Y = gaugeType === steelseries.GaugeType.TYPE3 ? 0.61 * imageHeight : 0.75 * imageHeight;
	
	        var trendIndicator = steelseries.TrendState.OFF;
	        var trendSize = size * 0.06;
	        var trendPosX = size * 0.38;
	        var trendPosY = size * 0.57;
	
	        switch (gaugeType.type) {
	        case 'type1':
	            freeAreaAngle = 0;
	            rotationOffset = PI;
	            bargraphOffset = 0;
	            tickmarkOffset = HALF_PI;
	            angleRange = HALF_PI;
	            degAngleRange = angleRange * DEG_FACTOR;
	            angleStep = angleRange / range;
	            break;
	
	        case 'type2':
	            freeAreaAngle = 0;
	            rotationOffset = PI;
	            bargraphOffset = 0;
	            tickmarkOffset = HALF_PI;
	            angleRange = PI;
	            degAngleRange = angleRange * DEG_FACTOR;
	            angleStep = angleRange / range;
	            break;
	
	        case 'type3':
	            freeAreaAngle = 0;
	            rotationOffset = HALF_PI;
	            bargraphOffset = -HALF_PI;
	            tickmarkOffset = 0;
	            angleRange = 1.5 * PI;
	            degAngleRange = angleRange * DEG_FACTOR;
	            angleStep = angleRange / range;
	            break;
	
	        case 'type4':
	        /* falls through */
	        default:
	            freeAreaAngle = 60 * RAD_FACTOR;
	            rotationOffset = HALF_PI + (freeAreaAngle / 2);
	            bargraphOffset = -TWO_PI / 6;
	            tickmarkOffset = 0;
	            angleRange = TWO_PI - freeAreaAngle;
	            degAngleRange = angleRange * DEG_FACTOR;
	            angleStep = angleRange / range;
	            break;
	        }
	
	        // Buffer for the frame
	        var frameBuffer = createBuffer(size, size);
	        var frameContext = frameBuffer.getContext('2d');
	
	        // Buffer for static background painting code
	        var backgroundBuffer = createBuffer(size, size);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        var lcdBuffer;
	
	        // Buffer for active bargraph led
	        var activeLedBuffer = createBuffer(Math.ceil(size * 0.060747), Math.ceil(size * 0.023364));
	        var activeLedContext = activeLedBuffer.getContext('2d');
	
	        // Buffer for led on painting code
	        var ledBufferOn = createBuffer(LED_SIZE, LED_SIZE);
	        var ledContextOn = ledBufferOn.getContext('2d');
	
	        // Buffer for led off painting code
	        var ledBufferOff = createBuffer(LED_SIZE, LED_SIZE);
	        var ledContextOff = ledBufferOff.getContext('2d');
	
	        // Buffer for current led painting code
	        var ledBuffer = ledBufferOff;
	
	        // Buffer for user led on painting code
	        var userLedBufferOn = createBuffer(LED_SIZE, LED_SIZE);
	        var userLedContextOn = userLedBufferOn.getContext('2d');
	
	        // Buffer for user led off painting code
	        var userLedBufferOff = createBuffer(LED_SIZE, LED_SIZE);
	        var userLedContextOff = userLedBufferOff.getContext('2d');
	
	        // Buffer for current user led painting code
	        var userLedBuffer = userLedBufferOff;
	        // Buffer for the background of the led
	        var ledBackground;
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(size, size);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        // Buffers for trend indicators
	        var trendUpBuffer, trendSteadyBuffer, trendDownBuffer, trendOffBuffer;
	
	        var initialized = false;
	
	        // Tickmark specific private variables
	        var niceMinValue = minValue;
	        var niceMaxValue = maxValue;
	        var niceRange = maxValue - minValue;
	        range = niceMaxValue - niceMinValue;
	        var minorTickSpacing = 0;
	        var majorTickSpacing = 0;
	        var maxNoOfMinorTicks = 10;
	        var maxNoOfMajorTicks = 10;
	
	        // Method to calculate nice values for min, max and range for the tickmarks
	        var calculate = function calculate() {
	            if (niceScale) {
	                niceRange = calcNiceNumber(maxValue - minValue, false);
	                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
	                niceMinValue = Math.floor(minValue / majorTickSpacing) * majorTickSpacing;
	                niceMaxValue = Math.ceil(maxValue / majorTickSpacing) * majorTickSpacing;
	                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
	                minValue = niceMinValue;
	                maxValue = niceMaxValue;
	                range = maxValue - minValue;
	            } else {
	                niceRange = (maxValue - minValue);
	                niceMinValue = minValue;
	                niceMaxValue = maxValue;
	                range = niceRange;
	                //minorTickSpacing = 1;
	                //majorTickSpacing = 10;
	                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
	                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
	            }
	
	            switch (gaugeType.type) {
	            case 'type1':
	                freeAreaAngle = 0;
	                rotationOffset = PI;
	                tickmarkOffset = HALF_PI;
	                angleRange = HALF_PI;
	                angleStep = angleRange / range;
	                break;
	
	            case 'type2':
	                freeAreaAngle = 0;
	                rotationOffset = PI;
	                tickmarkOffset = HALF_PI;
	                angleRange = PI;
	                angleStep = angleRange / range;
	                break;
	
	            case 'type3':
	                freeAreaAngle = 0;
	                rotationOffset = HALF_PI;
	                tickmarkOffset = 0;
	                angleRange = 1.5 * PI;
	                angleStep = angleRange / range;
	                break;
	
	            case 'type4':       // fall through
	            /* falls through */
	            default:
	                freeAreaAngle = 60 * RAD_FACTOR;
	                rotationOffset = HALF_PI + (freeAreaAngle / 2);
	                tickmarkOffset = 0;
	                angleRange = TWO_PI - freeAreaAngle;
	                angleStep = angleRange / range;
	                break;
	            }
	            angle = rotationOffset + (value - minValue) * angleStep;
	        };
	
	        //********************************* Private methods *********************************
	        // Draw all static painting code to background
	        var init = function (parameters) {
	            parameters = parameters || {};
	            var drawFrame = (undefined === parameters.frame ? false : parameters.frame);
	            var drawBackground = (undefined === parameters.background ? false : parameters.background);
	            var drawLed = (undefined === parameters.led ? false : parameters.led);
	            var drawUserLed = (undefined === parameters.userLed ? false : parameters.userLed);
	            var drawValue =  (undefined === parameters.value ? false : parameters.value);
	            var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
	            var drawTrend = (undefined === parameters.trend ? false : parameters.trend);
	
	            initialized = true;
	
	            calculate();
	
	            // Create frame in frame buffer (frameBuffer)
	            if (drawFrame && frameVisible) {
	                drawRadialFrameImage(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            // Create background in background buffer (backgroundBuffer)
	            if (drawBackground && backgroundVisible) {
	                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
	
	                // Create custom layer in background buffer (backgroundBuffer)
	                drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            if (drawLed) {
	                // Draw LED ON in ledBuffer_ON
	                ledContextOn.drawImage(createLedImage(LED_SIZE, 1, ledColor), 0, 0);
	
	                // Draw LED OFF in ledBuffer_OFF
	                ledContextOff.drawImage(createLedImage(LED_SIZE, 0, ledColor), 0, 0);
	
	                // Buffer the background of the led for blinking
	                ledBackground = backgroundContext.getImageData(LED_POS_X, LED_POS_Y, LED_SIZE, LED_SIZE);
	            }
	
	            if (drawUserLed) {
	                // Draw user LED ON in userLedBuffer_ON
	                userLedContextOn.drawImage(createLedImage(Math.ceil(LED_SIZE), 1, userLedColor), 0, 0);
	
	                // Draw user LED OFF in userLedBuffer_OFF
	                userLedContextOff.drawImage(createLedImage(Math.ceil(LED_SIZE), 0, userLedColor), 0, 0);
	            }
	
	            if (drawBackground) {
	                // Create bargraphtrack in background buffer (backgroundBuffer)
	                drawBargraphTrackImage(backgroundContext);
	            }
	
	            // Create tickmarks in background buffer (backgroundBuffer)
	            if (drawBackground  && backgroundVisible) {
	                drawTickmarksImage(backgroundContext, labelNumberFormat);
	
	                // Create title in background buffer (backgroundBuffer)
	                drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, true, true);
	            }
	
	            // Create lcd background if selected in background buffer (backgroundBuffer)
	            if (drawBackground && lcdVisible) {
	                lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor);
	                backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY);
	            }
	
	            // Convert Section values into angles
	            isSectionsVisible = false;
	            if (useSectionColors && null !== section && 0 < section.length) {
	                isSectionsVisible = true;
	                var sectionIndex = section.length;
	                sectionAngles = [];
	                do {
	                    sectionIndex--;
	                    sectionAngles.push({start: (((section[sectionIndex].start + Math.abs(minValue)) / (maxValue - minValue)) * degAngleRange),
	                                         stop: (((section[sectionIndex].stop + Math.abs(minValue)) / (maxValue - minValue)) * degAngleRange),
	                                        color: customColorDef(section[sectionIndex].color)});
	                } while (0 < sectionIndex);
	            }
	
	            // Use a gradient for the valueColor?
	            isGradientVisible = false;
	            if (useValueGradient && valueGradient !== null) {
	                // force section colors off!
	                isSectionsVisible = false;
	                isGradientVisible = true;
	            }
	
	            // Create an image of an active led in active led buffer (activeLedBuffer)
	            if (drawValue) {
	                drawActiveLed(activeLedContext, valueColor);
	            }
	
	            // Create foreground in foreground buffer (foregroundBuffer)
	            if (drawForeground && foregroundVisible) {
	                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, false);
	            }
	
	            // Create the trend indicator buffers
	            if (drawTrend && trendVisible) {
	                trendUpBuffer = createTrendIndicator(trendSize, steelseries.TrendState.UP, trendColors);
	                trendSteadyBuffer = createTrendIndicator(trendSize, steelseries.TrendState.STEADY, trendColors);
	                trendDownBuffer = createTrendIndicator(trendSize, steelseries.TrendState.DOWN, trendColors);
	                trendOffBuffer = createTrendIndicator(trendSize, steelseries.TrendState.OFF, trendColors);
	            }
	        };
	
	        var resetBuffers = function (buffers) {
	            buffers = buffers || {};
	            var resetFrame = (undefined === buffers.frame ? false : buffers.frame);
	            var resetBackground = (undefined === buffers.background ? false : buffers.background);
	            var resetLed = (undefined === buffers.led ? false : buffers.led);
	            var resetUserLed = (undefined === buffers.userLed ? false : buffers.userLed);
	            var resetValue = (undefined === buffers.value ? false : buffers.value);
	            var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);
	
	            // Buffer for the frame
	            if (resetFrame) {
	                frameBuffer.width = size;
	                frameBuffer.height = size;
	                frameContext = frameBuffer.getContext('2d');
	            }
	
	            // Buffer for static background painting code
	            if (resetBackground) {
	                backgroundBuffer.width = size;
	                backgroundBuffer.height = size;
	                backgroundContext = backgroundBuffer.getContext('2d');
	            }
	
	            // Buffer for active bargraph led
	            if (resetValue) {
	                activeLedBuffer.width = Math.ceil(size * 0.060747);
	                activeLedBuffer.height = Math.ceil(size * 0.023364);
	                activeLedContext = activeLedBuffer.getContext('2d');
	            }
	
	            if (resetLed) {
	                // Buffer for led on painting code
	                ledBufferOn.width = Math.ceil(LED_SIZE);
	                ledBufferOn.height = Math.ceil(LED_SIZE);
	                ledContextOn = ledBufferOn.getContext('2d');
	
	                // Buffer for led off painting code
	                ledBufferOff.width = Math.ceil(LED_SIZE);
	                ledBufferOff.height = Math.ceil(LED_SIZE);
	                ledContextOff = ledBufferOff.getContext('2d');
	
	                // Buffer for current led painting code
	                ledBuffer = ledBufferOff;
	            }
	
	            if (resetUserLed) {
	                userLedBufferOn.width = Math.ceil(LED_SIZE);
	                userLedBufferOn.height = Math.ceil(LED_SIZE);
	                userLedContextOn = userLedBufferOn.getContext('2d');
	
	                userLedBufferOff.width = Math.ceil(LED_SIZE);
	                userLedBufferOff.height = Math.ceil(LED_SIZE);
	                userLedContextOff = userLedBufferOff.getContext('2d');
	
	                // Buffer for current user led painting code
	                userLedBuffer = userLedBufferOff;
	            }
	
	            // Buffer for static foreground painting code
	            if (resetForeground) {
	                foregroundBuffer.width = size;
	                foregroundBuffer.height = size;
	                foregroundContext = foregroundBuffer.getContext('2d');
	            }
	        };
	
	        var drawBargraphTrackImage = function (ctx) {
	
	            ctx.save();
	
	            // Bargraphtrack
	
	            // Frame
	            ctx.save();
	            ctx.lineWidth = size * 0.085;
	            ctx.beginPath();
	            ctx.translate(centerX, centerY);
	            ctx.rotate(rotationOffset - 4 * RAD_FACTOR);
	            ctx.translate(-centerX, -centerY);
	            ctx.arc(centerX, centerY, imageWidth * 0.355140, 0, angleRange + 8 * RAD_FACTOR, false);
	            ctx.rotate(-rotationOffset);
	            var ledTrackFrameGradient = ctx.createLinearGradient(0, 0.107476 * imageHeight, 0, 0.897195 * imageHeight);
	            ledTrackFrameGradient.addColorStop(0, '#000000');
	            ledTrackFrameGradient.addColorStop(0.22, '#333333');
	            ledTrackFrameGradient.addColorStop(0.76, '#333333');
	            ledTrackFrameGradient.addColorStop(1, '#cccccc');
	            ctx.strokeStyle = ledTrackFrameGradient;
	            ctx.stroke();
	            ctx.restore();
	
	            // Main
	            ctx.save();
	            ctx.lineWidth = size * 0.075;
	            ctx.beginPath();
	            ctx.translate(centerX, centerY);
	            ctx.rotate(rotationOffset - 4 * RAD_FACTOR);
	            ctx.translate(-centerX, -centerY);
	            ctx.arc(centerX, centerY, imageWidth * 0.355140, 0, angleRange + 8 * RAD_FACTOR, false);
	            ctx.rotate(-rotationOffset);
	            var ledTrackMainGradient = ctx.createLinearGradient(0, 0.112149 * imageHeight, 0, 0.892523 * imageHeight);
	            ledTrackMainGradient.addColorStop(0, '#111111');
	            ledTrackMainGradient.addColorStop(1, '#333333');
	            ctx.strokeStyle = ledTrackMainGradient;
	            ctx.stroke();
	            ctx.restore();
	
	            // Draw inactive leds
	            var ledCenterX = (imageWidth * 0.116822 + imageWidth * 0.060747) / 2;
	            var ledCenterY = (imageWidth * 0.485981 + imageWidth * 0.023364) / 2;
	            var ledOffGradient = ctx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, 0.030373 * imageWidth);
	            ledOffGradient.addColorStop(0, '#3c3c3c');
	            ledOffGradient.addColorStop(1, '#323232');
	            var angle = 0;
	            for (angle = 0; angle <= degAngleRange; angle += 5) {
	                ctx.save();
	                ctx.translate(centerX, centerY);
	                ctx.rotate((angle * RAD_FACTOR) + bargraphOffset);
	                ctx.translate(-centerX, -centerY);
	                ctx.beginPath();
	                ctx.rect(imageWidth * 0.116822, imageWidth * 0.485981, imageWidth * 0.060747, imageWidth * 0.023364);
	                ctx.closePath();
	                ctx.fillStyle = ledOffGradient;
	                ctx.fill();
	                ctx.restore();
	            }
	
	            ctx.restore();
	        };
	
	        var drawActiveLed = function (ctx, color) {
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
	            ctx.closePath();
	            var ledCenterX = (ctx.canvas.width / 2);
	            var ledCenterY = (ctx.canvas.height / 2);
	            var ledGradient = mainCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, ctx.canvas.width / 2);
	            ledGradient.addColorStop(0, color.light.getRgbaColor());
	            ledGradient.addColorStop(1, color.dark.getRgbaColor());
	            ctx.fillStyle = ledGradient;
	            ctx.fill();
	            ctx.restore();
	        };
	
	        var drawLcdText = function (ctx, value) {
	
	            ctx.save();
	            ctx.textAlign = 'right';
	            ctx.strokeStyle = lcdColor.textColor;
	            ctx.fillStyle = lcdColor.textColor;
	
	            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
	                ctx.shadowColor = 'gray';
	                ctx.shadowOffsetX = imageWidth * 0.007;
	                ctx.shadowOffsetY = imageWidth * 0.007;
	                ctx.shadowBlur = imageWidth * 0.007;
	            }
	
	            if (digitalFont) {
	                ctx.font = lcdFont;
	            } else {
	                ctx.font = stdFont;
	            }
	            ctx.fillText(value.toFixed(lcdDecimals), lcdPosX + lcdWidth - lcdWidth * 0.05, lcdPosY + lcdHeight * 0.5 + lcdFontHeight * 0.38, lcdWidth * 0.9);
	
	            ctx.restore();
	        };
	
	        var drawTickmarksImage = function (ctx, labelNumberFormat) {
	            var alpha = rotationOffset,      // Tracks total rotation
	                rotationStep = angleStep * minorTickSpacing,
	                textRotationAngle,
	                fontSize = Math.ceil(imageWidth * 0.04),
	                valueCounter = minValue,
	                majorTickCounter = maxNoOfMinorTicks - 1,
	                TEXT_TRANSLATE_X = imageWidth * 0.28,
	                TEXT_WIDTH = imageWidth * 0.1,
	                MAX_VALUE_ROUNDED = parseFloat(maxValue.toFixed(2)),
	                i;
	
	            backgroundColor.labelColor.setAlpha(1);
	            ctx.save();
	            ctx.textAlign = 'center';
	            ctx.textBaseline = 'middle';
	            ctx.font = fontSize + 'px ' + stdFontName;
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.translate(centerX, centerY);
	            ctx.rotate(rotationOffset);
	
	            if (gaugeType.type === 'type1' || gaugeType.type === 'type2') {
	                TEXT_WIDTH = imageWidth * 0.0375;
	            }
	
	            for (i = minValue; parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED; i += minorTickSpacing) {
	                textRotationAngle = + rotationStep + HALF_PI;
	                majorTickCounter++;
	                // Draw major tickmarks
	                if (majorTickCounter === maxNoOfMinorTicks) {
	                    ctx.save();
	                    ctx.translate(TEXT_TRANSLATE_X, 0);
	
	                    switch (tickLabelOrientation.type) {
	                    case 'horizontal':
	                        textRotationAngle = -alpha;
	                        break;
	
	                    case 'tangent':
	                        textRotationAngle = (alpha <= HALF_PI + PI ? PI : 0);
	                        break;
	
	                    case 'normal':
	                    /* falls through */
	                    default:
	                        textRotationAngle = HALF_PI;
	                        break;
	                    }
	                    ctx.rotate(textRotationAngle);
	
	                    switch (labelNumberFormat.format) {
	                    case 'fractional':
	                        ctx.fillText((valueCounter.toFixed(fractionalScaleDecimals)), 0, 0, TEXT_WIDTH);
	                        break;
	
	                    case 'scientific':
	                        ctx.fillText((valueCounter.toPrecision(2)), 0, 0, TEXT_WIDTH);
	                        break;
	
	                    case 'standard':
	                    /* falls through */
	                    default:
	                        ctx.fillText((valueCounter.toFixed(0)), 0, 0, TEXT_WIDTH);
	                        break;
	                    }
	                    ctx.translate(-TEXT_TRANSLATE_X, 0);
	                    ctx.restore();
	
	                    valueCounter += majorTickSpacing;
	                    majorTickCounter = 0;
	                    ctx.rotate(rotationStep);
	                    alpha += rotationStep;
	                    continue;
	                }
	                ctx.rotate(rotationStep);
	                alpha += rotationStep;
	            }
	
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        var blink = function (blinking) {
	            if (blinking) {
	                ledTimerId = setInterval(toggleAndRepaintLed, 1000);
	            } else {
	                clearInterval(ledTimerId);
	                ledBuffer = ledBufferOff;
	            }
	        };
	
	        var blinkUser = function (blinking) {
	            if (blinking) {
	                userLedTimerId = setInterval(toggleAndRepaintUserLed, 1000);
	            } else {
	                clearInterval(userLedTimerId);
	                userLedBuffer = userLedBufferOff;
	            }
	        };
	
	        var toggleAndRepaintLed = function () {
	            if (ledVisible) {
	                if (ledBuffer === ledBufferOn) {
	                    ledBuffer = ledBufferOff;
	                } else {
	                    ledBuffer = ledBufferOn;
	                }
	                if (!repainting) {
	                    repainting = true;
	                    requestAnimFrame(self.repaint);
	                }
	            }
	        };
	
	        var toggleAndRepaintUserLed = function () {
	            if (userLedVisible) {
	                if (userLedBuffer === userLedBufferOn) {
	                    userLedBuffer = userLedBufferOff;
	                } else {
	                    userLedBuffer = userLedBufferOn;
	                }
	                if (!repainting) {
	                    repainting = true;
	                    requestAnimFrame(self.repaint);
	                }
	            }
	        };
	
	        //********************************* Public methods *********************************
	        this.setValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
	            if (value !== targetValue) {
	                value = targetValue;
	                if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                    (value <= threshold && !ledBlinking && !thresholdRising)) {
	                    ledBlinking = true;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.play();
	                    }
	                } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                           (value > threshold && ledBlinking && !thresholdRising)) {
	                    ledBlinking = false;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.pause();
	                    }
	                }
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.setValueAnimated = function (newValue, callback) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue)),
	                gauge = this,
	                time;
	
	            if (value !== targetValue) {
	                if (undefined !== tween && tween.isPlaying) {
	                    tween.stop();
	                }
	
	                time = fullScaleDeflectionTime * Math.abs(targetValue - value) / (maxValue - minValue);
	                time = Math.max(time, fullScaleDeflectionTime / 5);
	                tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, time);
	                //tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, 1);
	                //tween = new Tween(new Object(), '', Tween.strongEaseInOut, this.value, targetValue, 1);
	                tween.onMotionChanged = function (event) {
	                    value = event.target._pos;
	
	                    if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                        (value <= threshold && !ledBlinking && !thresholdRising)) {
	                        ledBlinking = true;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.play();
	                        }
	                    } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                               (value > threshold && ledBlinking && !thresholdRising)) {
	                        ledBlinking = false;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.pause();
	                        }
	                    }
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tween.onMotionFinished = callback;
	                }
	
	                tween.start();
	            }
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers({frame: true});
	            frameDesign = newFrameDesign;
	            init({frame: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers({background: true,
	                          led: true});
	            backgroundColor = newBackgroundColor;
	            init({background: true,
	                  led: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers({foreground: true});
	            foregroundType = newForegroundType;
	            init({foreground: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setValueColor = function (newValueColor) {
	            resetBuffers({value: true});
	            valueColor = newValueColor;
	            init({value: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLedColor = function (newLedColor) {
	            resetBuffers({led: true});
	            ledColor = newLedColor;
	            init({led: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setUserLedColor = function (newLedColor) {
	            resetBuffers({userLed: true});
	            userLedColor = newLedColor;
	            init({userLed: true});
	            this.repaint();
	            return this;
	        };
	
	        this.toggleUserLed = function () {
	            if (userLedBuffer === userLedBufferOn) {
	                userLedBuffer = userLedBufferOff;
	            } else {
	                userLedBuffer = userLedBufferOn;
	            }
	            this.repaint();
	            return this;
	        };
	
	        this.setUserLedOnOff = function (on) {
	            if (true === on) {
	                userLedBuffer = userLedBufferOn;
	            } else {
	                userLedBuffer = userLedBufferOff;
	            }
	            this.repaint();
	            return this;
	        };
	
	        this.blinkUserLed = function (blink) {
	            if (blink) {
	                if (!userLedBlinking) {
	                    blinkUser(true);
	                    userLedBlinking = true;
	                }
	            } else {
	                if (userLedBlinking) {
	                    clearInterval(userLedTimerId);
	                    userLedBlinking = false;
	                }
	            }
	            return this;
	        };
	
	        this.setLedVisible = function (visible) {
	            ledVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setUserLedVisible = function (visible) {
	            userLedVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdColor = function (newLcdColor) {
	            lcdColor = newLcdColor;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdDecimals = function (decimals) {
	            lcdDecimals = parseInt(decimals, 10);
	            this.repaint();
	            return this;
	        };
	
	        this.setSection = function (areaSec) {
	            section = areaSec;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setSectionActive = function (value) {
	            useSectionColors = value;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setGradient = function (grad) {
	            valueGradient = grad;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setGradientActive = function (value) {
	            useValueGradient = value;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setMinValue = function (value) {
	            minValue = value;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.getMinValue = function () {
	            return minValue;
	        };
	
	        this.setMaxValue = function (value) {
	            maxValue = value;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.getMaxValue = function () {
	            return maxValue;
	        };
	
	        this.setThreshold = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue);
	            threshold = targetValue;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setThresholdRising = function (rising) {
	            thresholdRising = !!rising;
	            // reset existing threshold alerts
	            ledBlinking = !ledBlinking;
	            blink(ledBlinking);
	            this.repaint();
	            return this;
	        };
	
	        this.setTitleString = function (title) {
	            titleString = title;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setUnitString = function (unit) {
	            unitString = unit;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setTrend = function (newValue) {
	            trendIndicator = newValue;
	            this.repaint();
	            return this;
	        };
	
	        this.setTrendVisible = function (visible) {
	            trendVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setFractionalScaleDecimals = function (decimals) {
	            fractionalScaleDecimals = parseInt(decimals, 10);
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	        };
	
	        this.setLabelNumberFormat = function (format) {
	            labelNumberFormat = format;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            var activeLedAngle = ((value - minValue) / (maxValue - minValue)) * degAngleRange,
	                activeLedColor,
	                lastActiveLedColor = valueColor,
	                angle, i,
	                currentValue,
	                gradRange,
	                fraction;
	
	            if (!initialized) {
	                init({frame: true,
	                      background: true,
	                      led: true,
	                      userLed: true,
	                      value: true,
	                      trend: true,
	                      foreground: true});
	            }
	
	            mainCtx.clearRect(0, 0, size, size);
	
	            // Draw frame image
	            if (frameVisible) {
	                mainCtx.drawImage(frameBuffer, 0, 0);
	            }
	
	            // Draw buffered image to visible canvas
	            mainCtx.drawImage(backgroundBuffer, 0, 0);
	
	            // Draw active leds
	            for (angle = 0; angle <= activeLedAngle; angle += 5) {
	                //check for LED color
	                activeLedColor = valueColor;
	                // Use a gradient for value colors?
	                if (isGradientVisible) {
	                    // Convert angle back to value
	                    currentValue = minValue + (angle / degAngleRange) * (maxValue - minValue);
	                    gradRange = valueGradient.getEnd() - valueGradient.getStart();
	                    fraction = currentValue / gradRange;
	                    fraction = Math.max(Math.min(fraction, 1), 0);
	                    activeLedColor = customColorDef(valueGradient.getColorAt(fraction).getRgbaColor());
	                } else if (isSectionsVisible) {
	                    for (i = 0; i < sectionAngles.length; i++) {
	                        if (angle >= sectionAngles[i].start && angle < sectionAngles[i].stop) {
	                            activeLedColor = sectionAngles[i].color;
	                            break;
	                        }
	                    }
	                }
	                // Has LED color changed? If so redraw the buffer
	                if (lastActiveLedColor.medium.getHexColor() !== activeLedColor.medium.getHexColor()) {
	                    drawActiveLed(activeLedContext, activeLedColor);
	                    lastActiveLedColor = activeLedColor;
	                }
	                mainCtx.save();
	                mainCtx.translate(centerX, centerY);
	                mainCtx.rotate((angle * RAD_FACTOR) + bargraphOffset);
	                mainCtx.translate(-centerX, -centerY);
	                mainCtx.drawImage(activeLedBuffer, ACTIVE_LED_POS_X, ACTIVE_LED_POS_Y);
	                mainCtx.restore();
	            }
	
	            // Draw lcd display
	            if (lcdVisible) {
	                drawLcdText(mainCtx, value);
	            }
	
	            // Draw led
	            if (ledVisible) {
	                mainCtx.drawImage(ledBuffer, LED_POS_X, LED_POS_Y);
	            }
	
	            // Draw user led
	            if (userLedVisible) {
	                mainCtx.drawImage(userLedBuffer, USER_LED_POS_X, USER_LED_POS_Y);
	            }
	
	            // Draw the trend indicator
	            if (trendVisible) {
	                switch (trendIndicator.state) {
	                case 'up':
	                    mainCtx.drawImage(trendUpBuffer, trendPosX, trendPosY);
	                    break;
	                case 'steady':
	                    mainCtx.drawImage(trendSteadyBuffer, trendPosX, trendPosY);
	                    break;
	                case 'down':
	                    mainCtx.drawImage(trendDownBuffer, trendPosX, trendPosY);
	                    break;
	                case 'off':
	                    mainCtx.drawImage(trendOffBuffer, trendPosX, trendPosY);
	                    break;
	                }
	            }
	
	            // Draw foreground
	            if (foregroundVisible) {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var radialVertical = function (canvas, parameters) {
	        parameters = parameters || {};
	        var orientation = (undefined === parameters.orientation ? steelseries.Orientation.NORTH : parameters.orientation),
	            size = (undefined === parameters.size ? 0 : parameters.size),
	            minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
	            maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
	            niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
	            threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue: parameters.threshold),
	            section = (undefined === parameters.section ? null : parameters.section),
	            area = (undefined === parameters.area ? null : parameters.area),
	            titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
	            unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            pointerType = (undefined === parameters.pointerType ? steelseries.PointerType.TYPE1 : parameters.pointerType),
	            pointerColor = (undefined === parameters.pointerColor ? steelseries.ColorDef.RED : parameters.pointerColor),
	            knobType = (undefined === parameters.knobType ? steelseries.KnobType.STANDARD_KNOB : parameters.knobType),
	            knobStyle = (undefined === parameters.knobStyle ? steelseries.KnobStyle.SILVER : parameters.knobStyle),
	            ledColor = (undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor),
	            ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
	            thresholdVisible = (undefined === parameters.thresholdVisible ? true : parameters.thresholdVisible),
	            thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
	            minMeasuredValueVisible = (undefined === parameters.minMeasuredValueVisible ? false : parameters.minMeasuredValueVisible),
	            maxMeasuredValueVisible = (undefined === parameters.maxMeasuredValueVisible ? false : parameters.maxMeasuredValueVisible),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            labelNumberFormat = (undefined === parameters.labelNumberFormat ? steelseries.LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
	            playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
	            alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
	            fullScaleDeflectionTime = (undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime);
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (size === 0) {
	            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        // Create audio tag for alarm sound
	        if (playAlarm && alarmSound !== false) {
	            var audioElement = doc.createElement('audio');
	            audioElement.setAttribute('src', alarmSound);
	            audioElement.setAttribute('preload', 'auto');
	        }
	        var gaugeType = steelseries.GaugeType.TYPE5;
	
	        var self = this;
	        var value = minValue;
	
	        // Properties
	        var minMeasuredValue = maxValue;
	        var maxMeasuredValue = minValue;
	        var imageWidth = size;
	        var imageHeight = size;
	
	        var ledBlinking = false;
	
	        var ledTimerId = 0;
	        var tween;
	        var repainting = false;
	
	        // Tickmark specific private variables
	        var niceMinValue = minValue;
	        var niceMaxValue = maxValue;
	        var niceRange = maxValue - minValue;
	        var range = niceMaxValue - niceMinValue;
	        var minorTickSpacing = 0;
	        var majorTickSpacing = 0;
	        var maxNoOfMinorTicks = 10;
	        var maxNoOfMajorTicks = 10;
	
	        var freeAreaAngle = 0;
	        var rotationOffset = 1.25 * PI;
	        var tickmarkOffset = 1.25 * PI;
	        var angleRange = HALF_PI;
	        var angleStep = angleRange / range;
	        var shadowOffset = imageWidth * 0.006;
	        var pointerOffset = imageWidth * 1.17 / 2;
	
	        var initialized = false;
	
	        var angle = rotationOffset + (value - minValue) * angleStep;
	
	        var centerX = imageWidth / 2;
	        var centerY = imageHeight * 0.733644;
	
	        // Misc
	        var ledPosX = 0.455 * imageWidth;
	        var ledPosY = 0.51 * imageHeight;
	
	        // Method to calculate nice values for min, max and range for the tickmarks
	        var calculate = function calculate() {
	            if (niceScale) {
	                niceRange = calcNiceNumber(maxValue - minValue, false);
	                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
	                niceMinValue = Math.floor(minValue / majorTickSpacing) * majorTickSpacing;
	                niceMaxValue = Math.ceil(maxValue / majorTickSpacing) * majorTickSpacing;
	                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
	                minValue = niceMinValue;
	                maxValue = niceMaxValue;
	                range = maxValue - minValue;
	            }
	            else {
	                niceRange = (maxValue - minValue);
	                niceMinValue = minValue;
	                niceMaxValue = maxValue;
	                range = niceRange;
	                minorTickSpacing = 1;
	                majorTickSpacing = 10;
	            }
	
	            freeAreaAngle = 0;
	            rotationOffset = 1.25 * PI;
	            tickmarkOffset = 1.25 * PI;
	            angleRange = HALF_PI;
	            angleStep = angleRange / range;
	
	            angle = rotationOffset + (value - minValue) * angleStep;
	        };
	
	        // **************   Buffer creation  ********************
	        // Buffer for the frame
	        var frameBuffer = createBuffer(size, size);
	        var frameContext = frameBuffer.getContext('2d');
	
	        // Buffer for the background
	        var backgroundBuffer = createBuffer(size, size);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        // Buffer for led on painting code
	        var ledBufferOn = createBuffer(size * 0.093457, size * 0.093457);
	        var ledContextOn = ledBufferOn.getContext('2d');
	
	        // Buffer for led off painting code
	        var ledBufferOff = createBuffer(size * 0.093457, size * 0.093457);
	        var ledContextOff = ledBufferOff.getContext('2d');
	
	        // Buffer for current led painting code
	        var ledBuffer = ledBufferOff;
	
	        // Buffer for the minMeasuredValue indicator
	        var minMeasuredValueBuffer = createBuffer(Math.ceil(size * 0.028037), Math.ceil(size * 0.028037));
	        var minMeasuredValueCtx = minMeasuredValueBuffer.getContext('2d');
	
	        // Buffer for the maxMeasuredValue indicator
	        var maxMeasuredValueBuffer = createBuffer(Math.ceil(size * 0.028037), Math.ceil(size * 0.028037));
	        var maxMeasuredValueCtx = maxMeasuredValueBuffer.getContext('2d');
	
	        // Buffer for pointer image painting code
	        var pointerBuffer = createBuffer(size, size);
	        var pointerContext = pointerBuffer.getContext('2d');
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(size, size);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        // **************   Image creation  ********************
	        var drawPostsImage = function (ctx) {
	            if ('type5' === gaugeType.type) {
	                ctx.save();
	                if (orientation.type === 'west') {
	                    // Min post
	                    ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.44, imageHeight * 0.80);
	                    // Max post
	                    ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.44, imageHeight * 0.16);
	                } else if (orientation.type === 'east') {
	                    // Min post
	                    ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.52, imageHeight * 0.80);
	                    // Max post
	                    ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.52, imageHeight * 0.16);
	                } else {
	                    // Min post
	                    ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.2 - imageHeight * 0.037383, imageHeight * 0.446666);
	                    // Max post
	                    ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.8, imageHeight * 0.446666);
	                }
	                ctx.restore();
	            }
	        };
	
	        var createThresholdImage = function () {
	            var thresholdBuffer = doc.createElement('canvas');
	            thresholdBuffer.width = Math.ceil(size * 0.046728);
	            thresholdBuffer.height = Math.ceil(thresholdBuffer.width * 0.9);
	            var thresholdCtx = thresholdBuffer.getContext('2d');
	
	            thresholdCtx.save();
	            var gradThreshold = thresholdCtx.createLinearGradient(0, 0.1, 0, thresholdBuffer.height * 0.9);
	            gradThreshold.addColorStop(0, '#520000');
	            gradThreshold.addColorStop(0.3, '#fc1d00');
	            gradThreshold.addColorStop(0.59, '#fc1d00');
	            gradThreshold.addColorStop(1, '#520000');
	            thresholdCtx.fillStyle = gradThreshold;
	
	            thresholdCtx.beginPath();
	            thresholdCtx.moveTo(thresholdBuffer.width * 0.5, 0.1);
	            thresholdCtx.lineTo(thresholdBuffer.width * 0.9, thresholdBuffer.height * 0.9);
	            thresholdCtx.lineTo(thresholdBuffer.width * 0.1, thresholdBuffer.height * 0.9);
	            thresholdCtx.lineTo(thresholdBuffer.width * 0.5, 0.1);
	            thresholdCtx.closePath();
	
	            thresholdCtx.fill();
	            thresholdCtx.strokeStyle = '#FFFFFF';
	            thresholdCtx.stroke();
	
	            thresholdCtx.restore();
	
	            return thresholdBuffer;
	        };
	
	        var drawAreaSectionImage = function (ctx, start, stop, color, filled) {
	            ctx.save();
	            ctx.strokeStyle = color;
	            ctx.fillStyle = color;
	            ctx.lineWidth = imageWidth * 0.035;
	            var startAngle = (angleRange / range * start - angleRange / range * minValue);
	            var stopAngle = startAngle + (stop - start) / (range / angleRange);
	            ctx.translate(centerX, centerY);
	            ctx.rotate(rotationOffset);
	            ctx.beginPath();
	            if (filled) {
	                ctx.moveTo(0, 0);
	                ctx.arc(0, 0, imageWidth * 0.365 - ctx.lineWidth / 2, startAngle, stopAngle, false);
	            } else {
	                ctx.arc(0, 0, imageWidth * 0.365, startAngle, stopAngle, false);
	            }
	            if (filled) {
	                ctx.moveTo(0, 0);
	                ctx.fill();
	            } else {
	                ctx.stroke();
	            }
	
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        var drawTitleImage = function (ctx) {
	            var titleWidth, unitWidth;
	            ctx.save();
	            ctx.textAlign = 'left';
	            ctx.textBaseline = 'middle';
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	
	            ctx.font = 0.046728 * imageWidth + 'px ' + stdFontName;
	            titleWidth = ctx.measureText(titleString).width;
	            ctx.fillText(titleString, (imageWidth - titleWidth) / 2, imageHeight * 0.4, imageWidth * 0.3);
	            unitWidth = ctx.measureText(unitString).width;
	            ctx.fillText(unitString, (imageWidth - unitWidth) / 2, imageHeight * 0.47, imageWidth * 0.2);
	
	            ctx.restore();
	        };
	
	        var drawTickmarksImage = function (ctx, labelNumberFormat) {
	            backgroundColor.labelColor.setAlpha(1);
	            ctx.save();
	
	            if (steelseries.Orientation.WEST === orientation) {
	                ctx.translate(centerX, centerX);
	                ctx.rotate(-HALF_PI);
	                ctx.translate(-centerX, -centerX);
	            }
	            if (steelseries.Orientation.EAST === orientation) {
	                ctx.translate(centerX, centerX);
	                ctx.rotate(HALF_PI);
	                ctx.translate(-centerX, -centerX);
	            }
	
	            ctx.textAlign = 'center';
	            ctx.textBaseline = 'middle';
	            var fontSize = Math.ceil(imageWidth * 0.04);
	            ctx.font = fontSize + 'px ' + stdFontName;
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.translate(centerX, centerY);
	            ctx.rotate(rotationOffset);
	            var rotationStep = angleStep * minorTickSpacing;
	            var textRotationAngle;
	
	            var valueCounter = minValue;
	            var majorTickCounter = maxNoOfMinorTicks - 1;
	
	            var OUTER_POINT = imageWidth * 0.44;
	            var MAJOR_INNER_POINT = imageWidth * 0.41;
	            var MED_INNER_POINT = imageWidth * 0.415;
	            var MINOR_INNER_POINT = imageWidth * 0.42;
	            var TEXT_TRANSLATE_X = imageWidth * 0.48;
	            var TEXT_WIDTH = imageWidth * 0.04;
	            var HALF_MAX_NO_OF_MINOR_TICKS = maxNoOfMinorTicks / 2;
	            var MAX_VALUE_ROUNDED = parseFloat(maxValue.toFixed(2));
	            var i;
	
	            for (i = minValue; parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED; i += minorTickSpacing) {
	                textRotationAngle = + rotationStep + HALF_PI;
	                majorTickCounter++;
	                // Draw major tickmarks
	                if (majorTickCounter === maxNoOfMinorTicks) {
	                    ctx.lineWidth = 1.5;
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(MAJOR_INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                    ctx.save();
	                    ctx.translate(TEXT_TRANSLATE_X, 0);
	                    ctx.rotate(textRotationAngle);
	                    switch (labelNumberFormat.format) {
	                    case 'fractional':
	                        ctx.fillText((valueCounter.toFixed(2)), 0, 0, TEXT_WIDTH);
	                        break;
	
	                    case 'scientific':
	                        ctx.fillText((valueCounter.toPrecision(2)), 0, 0, TEXT_WIDTH);
	                        break;
	
	                    case 'standard':
	                    /* falls through */
	                    default:
	                        ctx.fillText((valueCounter.toFixed(0)), 0, 0, TEXT_WIDTH);
	                        break;
	                    }
	                    ctx.translate(-TEXT_TRANSLATE_X, 0);
	                    ctx.restore();
	
	                    valueCounter += majorTickSpacing;
	                    majorTickCounter = 0;
	                    ctx.rotate(rotationStep);
	                    continue;
	                }
	
	                // Draw tickmark every minor tickmark spacing
	                if (0 === maxNoOfMinorTicks % 2 && majorTickCounter === (HALF_MAX_NO_OF_MINOR_TICKS)) {
	                    ctx.lineWidth = 1;
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(MED_INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                } else {
	                    ctx.lineWidth = 0.5;
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(MINOR_INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                }
	                ctx.rotate(rotationStep);
	            }
	
	            /*
	             // Logarithmic scale
	             var tmp = 0.1;
	             var minValueLog10 = 0.1;
	             var maxValueLog10 = parseInt(Math.pow(10, Math.ceil(Math.log10(maxValue))));
	             var drawLabel = true;
	             angleStep = angleRange / (maxValueLog10 - minValueLog10)
	             for (var scaleFactor = minValueLog10 ; scaleFactor <= maxValueLog10 ; scaleFactor *= 10)
	             {
	             for (var i = parseFloat((1 * scaleFactor).toFixed(1)) ; i < parseFloat((10 * scaleFactor).toFixed(1)) ; i += scaleFactor)
	             {
	             textRotationAngle =+ rotationStep + HALF_PI;
	
	             if(drawLabel)
	             {
	             ctx.lineWidth = 1.5;
	             ctx.beginPath();
	             ctx.moveTo(imageWidth * 0.38,0);
	             ctx.lineTo(imageWidth * 0.35,0);
	             ctx.closePath();
	             ctx.stroke();
	             ctx.save();
	             ctx.translate(imageWidth * 0.31, 0);
	             ctx.rotate(textRotationAngle);
	             ctx.fillText(parseFloat((i).toFixed(1)), 0, 0, imageWidth * 0.0375);
	             ctx.translate(-imageWidth * 0.31, 0);
	             ctx.restore();
	             drawLabel = false;
	             }
	             else
	             {
	             ctx.lineWidth = 0.5;
	             ctx.beginPath();
	             ctx.moveTo(imageWidth * 0.38,0);
	             ctx.lineTo(imageWidth * 0.36,0);
	             ctx.closePath();
	             ctx.stroke();
	             }
	             //doc.write('log10 scale value: ' + parseFloat((i).toFixed(1)) + '<br>');
	             //Math.log10(parseFloat((i).toFixed(1)));
	
	             ctx.rotate(rotationStep);
	             }
	             tmp = 0.1;
	             drawLabel = true;
	             }
	             */
	
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        // **************   Initialization  ********************
	        // Draw all static painting code to background
	        var init = function (parameters) {
	            parameters = parameters || {};
	            var drawFrame = (undefined === parameters.frame ? false : parameters.frame);
	            var drawBackground = (undefined === parameters.background ? false : parameters.background);
	            var drawLed = (undefined === parameters.led ? false : parameters.led);
	            var drawPointer = (undefined === parameters.pointer ? false : parameters.pointer);
	            var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
	
	            initialized = true;
	
	            // Calculate the current min and max values and the range
	            calculate();
	
	            // Create frame in frame buffer (backgroundBuffer)
	            if (drawFrame && frameVisible) {
	                drawRadialFrameImage(frameContext, frameDesign, centerX, size / 2, imageWidth, imageHeight);
	            }
	
	            // Create background in background buffer (backgroundBuffer)
	            if (drawBackground && backgroundVisible) {
	                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, size / 2, imageWidth, imageHeight);
	            }
	
	            // Draw LED ON in ledBuffer_ON
	            if (drawLed) {
	                ledContextOn.drawImage(createLedImage(Math.ceil(size * 0.093457), 1, ledColor), 0, 0);
	
	                // Draw LED ON in ledBuffer_OFF
	                ledContextOff.drawImage(createLedImage(Math.ceil(size * 0.093457), 0, ledColor), 0, 0);
	            }
	
	            // Draw min measured value indicator in minMeasuredValueBuffer
	            if (minMeasuredValueVisible) {
	                minMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * 0.028037), steelseries.ColorDef.BLUE.dark.getRgbaColor(), true, true), 0, 0);
	                minMeasuredValueCtx.restore();
	            }
	
	            // Draw max measured value indicator in maxMeasuredValueBuffer
	            if (maxMeasuredValueVisible) {
	                maxMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * 0.028037), steelseries.ColorDef.RED.medium.getRgbaColor(), true), 0, 0);
	                maxMeasuredValueCtx.restore();
	            }
	
	            // Create alignment posts in background buffer (backgroundBuffer)
	            if (drawBackground && backgroundVisible) {
	                drawPostsImage(backgroundContext);
	
	                // Create section in background buffer (backgroundBuffer)
	                if (null !== section && 0 < section.length) {
	                    backgroundContext.save();
	                    if (steelseries.Orientation.WEST === orientation) {
	                        backgroundContext.translate(centerX, centerX);
	                        backgroundContext.rotate(-HALF_PI);
	                        backgroundContext.translate(-centerX, -centerX);
	                    } else if (steelseries.Orientation.EAST === orientation) {
	                        backgroundContext.translate(centerX, centerX);
	                        backgroundContext.rotate(HALF_PI);
	                        backgroundContext.translate(-centerX, -centerX);
	                    }
	                    var sectionIndex = section.length;
	                    do {
	                        sectionIndex--;
	                        drawAreaSectionImage(backgroundContext, section[sectionIndex].start, section[sectionIndex].stop, section[sectionIndex].color, false);
	                    }
	                    while (0 < sectionIndex);
	                    backgroundContext.restore();
	                }
	
	                // Create area in background buffer (backgroundBuffer)
	                if (null !== area && 0 < area.length) {
	                    if (steelseries.Orientation.WEST === orientation) {
	                        backgroundContext.translate(centerX, centerX);
	                        backgroundContext.rotate(-HALF_PI);
	                        backgroundContext.translate(-centerX, -centerX);
	                    }
	                    if (steelseries.Orientation.EAST === orientation) {
	                        backgroundContext.translate(centerX, centerX);
	                        backgroundContext.rotate(HALF_PI);
	                        backgroundContext.translate(-centerX, -centerX);
	                    }
	                    var areaIndex = area.length;
	                    do {
	                        areaIndex--;
	                        drawAreaSectionImage(backgroundContext, area[areaIndex].start, area[areaIndex].stop, area[areaIndex].color, true);
	                    }
	                    while (0 < areaIndex);
	                    backgroundContext.restore();
	                }
	
	                // Create tickmarks in background buffer (backgroundBuffer)
	                drawTickmarksImage(backgroundContext, labelNumberFormat);
	
	                // Create title in background buffer (backgroundBuffer)
	                drawTitleImage(backgroundContext);
	            }
	
	            // Draw threshold image to background context
	            if (thresholdVisible) {
	                backgroundContext.save();
	                if (steelseries.Orientation.WEST === orientation) {
	                    backgroundContext.translate(centerX, centerX);
	                    backgroundContext.rotate(-HALF_PI);
	                    backgroundContext.translate(-centerX, -centerX);
	                }
	                if (steelseries.Orientation.EAST === orientation) {
	                    backgroundContext.translate(centerX, centerX);
	                    backgroundContext.rotate(HALF_PI);
	                    backgroundContext.translate(-centerX, -centerX);
	                }
	                backgroundContext.translate(centerX, centerY);
	                backgroundContext.rotate(rotationOffset + (threshold - minValue) * angleStep + HALF_PI);
	                backgroundContext.translate(-centerX, -centerY);
	                backgroundContext.drawImage(createThresholdImage(), imageWidth * 0.475, imageHeight * 0.32);
	                backgroundContext.restore();
	            }
	
	            // Create pointer image in pointer buffer (contentBuffer)
	            if (drawPointer) {
	                drawPointerImage(pointerContext, imageWidth * 1.17, pointerType, pointerColor, backgroundColor.labelColor);
	
	            }
	
	            // Create foreground in foreground buffer (foregroundBuffer)
	            if (drawForeground && foregroundVisible) {
	                var knobVisible = (pointerType.type === 'type15' || pointerType.type === 'type16' ? false : true);
	                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, knobVisible, knobType, knobStyle, gaugeType, orientation);
	            }
	        };
	
	        var resetBuffers = function (buffers) {
	            buffers = buffers || {};
	            var resetFrame = (undefined === buffers.frame ? false : buffers.frame);
	            var resetBackground = (undefined === buffers.background ? false : buffers.background);
	            var resetLed = (undefined === buffers.led ? false : buffers.led);
	            var resetPointer = (undefined === buffers.pointer ? false : buffers.pointer);
	            var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);
	
	            if (resetFrame) {
	                frameBuffer.width = size;
	                frameBuffer.height = size;
	                frameContext = frameBuffer.getContext('2d');
	            }
	
	            if (resetBackground) {
	                backgroundBuffer.width = size;
	                backgroundBuffer.height = size;
	                backgroundContext = backgroundBuffer.getContext('2d');
	            }
	
	            if (resetLed) {
	                ledBufferOn.width = Math.ceil(size * 0.093457);
	                ledBufferOn.height = Math.ceil(size * 0.093457);
	                ledContextOn = ledBufferOn.getContext('2d');
	
	                ledBufferOff.width = Math.ceil(size * 0.093457);
	                ledBufferOff.height = Math.ceil(size * 0.093457);
	                ledContextOff = ledBufferOff.getContext('2d');
	
	                // Buffer for current led painting code
	                ledBuffer = ledBufferOff;
	            }
	
	            if (resetPointer) {
	                pointerBuffer.width = size;
	                pointerBuffer.height = size;
	                pointerContext = pointerBuffer.getContext('2d');
	            }
	
	            if (resetForeground) {
	                foregroundBuffer.width = size;
	                foregroundBuffer.height = size;
	                foregroundContext = foregroundBuffer.getContext('2d');
	            }
	        };
	
	        var blink = function (blinking) {
	            if (blinking) {
	                ledTimerId = setInterval(toggleAndRepaintLed, 1000);
	            } else {
	                clearInterval(ledTimerId);
	                ledBuffer = ledBufferOff;
	            }
	        };
	
	        var toggleAndRepaintLed = function () {
	            if (ledVisible) {
	                if (ledBuffer === ledBufferOn) {
	                    ledBuffer = ledBufferOff;
	                } else {
	                    ledBuffer = ledBufferOn;
	                }
	                if (!repainting) {
	                    repainting = true;
	                    requestAnimFrame(self.repaint);
	                }
	            }
	        };
	
	        //************************************ Public methods **************************************
	        this.setValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
	            if (value !== targetValue) {
	                value = targetValue;
	
	                if (value > maxMeasuredValue) {
	                    maxMeasuredValue = value;
	                }
	                if (value < minMeasuredValue) {
	                    minMeasuredValue = value;
	                }
	
	                if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                    (value <= threshold && !ledBlinking && !thresholdRising)) {
	                    ledBlinking = true;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.play();
	                    }
	                } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                           (value > threshold && ledBlinking && !thresholdRising)) {
	                    ledBlinking = false;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.pause();
	                    }
	                }
	
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.setValueAnimated = function (newValue, callback) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue)),
	                gauge = this,
	                time;
	
	            if (value !== targetValue) {
	                if (undefined !==  tween && tween.isPlaying) {
	                    tween.stop();
	                }
	
	                time = fullScaleDeflectionTime * Math.abs(targetValue - value) / (maxValue - minValue);
	                time = Math.max(time, fullScaleDeflectionTime / 5);
	                tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, time);
	                //tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, 1);
	                //tween = new Tween(new Object(), '', Tween.strongEaseInOut, value, targetValue, 1);
	                tween.onMotionChanged = function (event) {
	                    value = event.target._pos;
	
	                    if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                        (value <= threshold && !ledBlinking && !thresholdRising)) {
	                        ledBlinking = true;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.play();
	                        }
	                    } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                               (value > threshold && ledBlinking && !thresholdRising)) {
	                        ledBlinking = false;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.pause();
	                        }
	                    }
	
	                    if (value > maxMeasuredValue) {
	                        maxMeasuredValue = value;
	                    }
	                    if (value < minMeasuredValue) {
	                        minMeasuredValue = value;
	                    }
	
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tween.onMotionFinished = callback;
	                }
	
	                tween.start();
	            }
	            return this;
	        };
	
	        this.resetMinMeasuredValue = function () {
	            minMeasuredValue = value;
	            this.repaint();
	            return this;
	        };
	
	        this.resetMaxMeasuredValue = function () {
	            maxMeasuredValue = value;
	            this.repaint();
	            return this;
	        };
	
	        this.setMinMeasuredValueVisible = function (visible) {
	            minMeasuredValueVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setMaxMeasuredValueVisible = function (visible) {
	            maxMeasuredValueVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setThresholdVisible = function (visible) {
	            thresholdVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setThresholdRising = function (rising) {
	            thresholdRising = !!rising;
	            // reset existing threshold alerts
	            ledBlinking = !ledBlinking;
	            blink(ledBlinking);
	            this.repaint();
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers({frame: true});
	            frameDesign = newFrameDesign;
	            init({frame: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers({background: true,
	                          pointer: (pointerType.type === 'type2' || pointerType.type === 'type13' ? true : false)       // type2 & 13 depend on background
	                          });
	            backgroundColor = newBackgroundColor;
	            init({background: true,
	                  pointer: (pointerType.type === 'type2' || pointerType.type === 'type13' ? true : false)       // type2 & 13 depend on background
	                });
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers({foreground: true});
	            foregroundType = newForegroundType;
	            init({foreground: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerType = function (newPointerType) {
	            resetBuffers({pointer: true,
	                          foreground: true  // Required as type15 does not need a knob
	                         });
	            pointerType = newPointerType;
	            init({pointer: true,
	                  foreground: true
	                 });
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerColor = function (newPointerColor) {
	            resetBuffers({pointer: true});
	            pointerColor = newPointerColor;
	            init({pointer: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLedColor = function (newLedColor) {
	            resetBuffers({led: true});
	            ledColor = newLedColor;
	            init({led: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLedVisible = function (visible) {
	            ledVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init({frame: true,
	                      background: true,
	                      led: true,
	                      pointer: true,
	                      foreground: true});
	            }
	
	            mainCtx.clearRect(0, 0, size, size);
	            mainCtx.save();
	
	            // Draw frame
	            if (frameVisible) {
	                mainCtx.drawImage(frameBuffer, 0, 0);
	            }
	
	            // Draw buffered image to visible canvas
	            mainCtx.drawImage(backgroundBuffer, 0, 0);
	
	            // Draw led
	            if (ledVisible) {
	                mainCtx.drawImage(ledBuffer, ledPosX, ledPosY);
	            }
	
	            if (steelseries.Orientation.WEST === orientation) {
	                mainCtx.translate(centerX, centerX);
	                mainCtx.rotate(-HALF_PI);
	                mainCtx.translate(-centerX, -centerX);
	            }
	            if (steelseries.Orientation.EAST === orientation) {
	                mainCtx.translate(centerX, centerX);
	                mainCtx.rotate(HALF_PI);
	                mainCtx.translate(-centerX, -centerX);
	            }
	
	            // Draw min measured value indicator
	            if (minMeasuredValueVisible) {
	                mainCtx.save();
	                mainCtx.translate(centerX, centerY);
	                mainCtx.rotate(rotationOffset + HALF_PI + (minMeasuredValue - minValue) * angleStep);
	                mainCtx.translate(-centerX, -centerY);
	                mainCtx.drawImage(minMeasuredValueBuffer, mainCtx.canvas.width * 0.4865, mainCtx.canvas.height * 0.27);
	                mainCtx.restore();
	            }
	
	            // Draw max measured value indicator
	            if (maxMeasuredValueVisible) {
	                mainCtx.save();
	                mainCtx.translate(centerX, centerY);
	                mainCtx.rotate(rotationOffset + HALF_PI + (maxMeasuredValue - minValue) * angleStep);
	                mainCtx.translate(-centerX, -centerY);
	                mainCtx.drawImage(maxMeasuredValueBuffer, mainCtx.canvas.width * 0.4865, mainCtx.canvas.height * 0.27);
	                mainCtx.restore();
	            }
	
	            angle = rotationOffset + HALF_PI + (value - minValue) * angleStep;
	
	            // Define rotation center
	            mainCtx.save();
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(angle);
	            // Set the pointer shadow params
	            mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
	            mainCtx.shadowBlur = shadowOffset * 2;
	            // Draw pointer
	            mainCtx.translate(-pointerOffset, -pointerOffset);
	            mainCtx.drawImage(pointerBuffer, 0, 0);
	            // Undo the translations & shadow settings
	            mainCtx.restore();
	
	            // Draw foreground
	            if (foregroundVisible) {
	                if (steelseries.Orientation.WEST === orientation) {
	                    mainCtx.translate(centerX, centerX);
	                    mainCtx.rotate(HALF_PI);
	                    mainCtx.translate(-centerX, -centerX);
	                } else if (steelseries.Orientation.EAST === orientation) {
	                    mainCtx.translate(centerX, centerX);
	                    mainCtx.rotate(-HALF_PI);
	                    mainCtx.translate(-centerX, -centerX);
	                }
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	            mainCtx.restore();
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var linear = function (canvas, parameters) {
	        parameters = parameters || {};
	        var gaugeType = (undefined === parameters.gaugeType ? steelseries.GaugeType.TYPE1 : parameters.gaugeType),
	            width = (undefined === parameters.width ? 0 : parameters.width),
	            height = (undefined === parameters.height ? 0 : parameters.height),
	            minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
	            maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
	            niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
	            threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue: parameters.threshold),
	            titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
	            unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            valueColor = (undefined === parameters.valueColor ? steelseries.ColorDef.RED : parameters.valueColor),
	            lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor),
	            lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
	            lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
	            digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
	            ledColor = (undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor),
	            ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
	            thresholdVisible = (undefined === parameters.thresholdVisible ? true : parameters.thresholdVisible),
	            thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
	            minMeasuredValueVisible = (undefined === parameters.minMeasuredValueVisible ? false : parameters.minMeasuredValueVisible),
	            maxMeasuredValueVisible = (undefined === parameters.maxMeasuredValueVisible ? false : parameters.maxMeasuredValueVisible),
	            labelNumberFormat = (undefined === parameters.labelNumberFormat ? steelseries.LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
	            alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
	            fullScaleDeflectionTime = (undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime);
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (width === 0) {
	            width = mainCtx.canvas.width;
	        }
	        if (height === 0) {
	            height = mainCtx.canvas.height;
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = width;
	        mainCtx.canvas.height = height;
	
	        var imageWidth = width;
	        var imageHeight = height;
	
	        // Create audio tag for alarm sound
	        if (playAlarm && alarmSound !== false) {
	            var audioElement = doc.createElement('audio');
	            audioElement.setAttribute('src', alarmSound);
	            //audioElement.setAttribute('src', 'js/alarm.mp3');
	            audioElement.setAttribute('preload', 'auto');
	        }
	
	        var self = this;
	        var value = minValue;
	
	        // Properties
	        var minMeasuredValue = maxValue;
	        var maxMeasuredValue = minValue;
	
	        // Check gaugeType is 1 or 2
	        if (gaugeType.type !== 'type1' && gaugeType.type !== 'type2') {
	            gaugeType = steelseries.GaugeType.TYPE1;
	        }
	
	        var tween;
	        var ledBlinking = false;
	        var repainting = false;
	
	        var ledTimerId = 0;
	
	        var vertical = width <= height;
	
	        // Constants
	        var ledPosX;
	        var ledPosY;
	        var ledSize = Math.round((vertical ? height : width) * 0.05);
	        var minMaxIndSize = Math.round((vertical ? width : height) * 0.05);
	        var stdFont;
	        var lcdFont;
	
	        // Misc
	        if (vertical) {
	            ledPosX = imageWidth / 2 - ledSize / 2;
	            ledPosY = (gaugeType.type === 'type1' ? 0.053 : 0.038) * imageHeight;
	            stdFont = Math.floor(imageHeight / 22) + 'px ' + stdFontName;
	            lcdFont = Math.floor(imageHeight / 22) + 'px ' + lcdFontName;
	        } else {
	            ledPosX = 0.89 * imageWidth;
	            ledPosY = imageHeight / 2 - ledSize / 2;
	            stdFont = Math.floor(imageHeight / 10) + 'px ' + stdFontName;
	            lcdFont = Math.floor(imageHeight / 10) + 'px ' + lcdFontName;
	        }
	
	        var initialized = false;
	
	        // Tickmark specific private variables
	        var niceMinValue = minValue;
	        var niceMaxValue = maxValue;
	        var niceRange = maxValue - minValue;
	        var range = niceMaxValue - niceMinValue;
	        var minorTickSpacing = 0;
	        var majorTickSpacing = 0;
	        var maxNoOfMinorTicks = 10;
	        var maxNoOfMajorTicks = 10;
	
	        // Method to calculate nice values for min, max and range for the tickmarks
	        var calculate = function calculate() {
	            if (niceScale) {
	                niceRange = calcNiceNumber(maxValue - minValue, false);
	                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
	                niceMinValue = Math.floor(minValue / majorTickSpacing) * majorTickSpacing;
	                niceMaxValue = Math.ceil(maxValue / majorTickSpacing) * majorTickSpacing;
	                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
	                minValue = niceMinValue;
	                maxValue = niceMaxValue;
	                range = maxValue - minValue;
	            } else {
	                niceRange = (maxValue - minValue);
	                niceMinValue = minValue;
	                niceMaxValue = maxValue;
	                range = niceRange;
	                minorTickSpacing = 1;
	                majorTickSpacing = 10;
	            }
	        };
	
	        // **************   Buffer creation  ********************
	        // Buffer for the frame
	        var frameBuffer = createBuffer(width, height);
	        var frameContext = frameBuffer.getContext('2d');
	
	        // Buffer for the background
	        var backgroundBuffer = createBuffer(width, height);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        var lcdBuffer;
	
	        // Buffer for led on painting code
	        var ledBufferOn = createBuffer(ledSize, ledSize);
	        var ledContextOn = ledBufferOn.getContext('2d');
	
	        // Buffer for led off painting code
	        var ledBufferOff = createBuffer(ledSize, ledSize);
	        var ledContextOff = ledBufferOff.getContext('2d');
	
	        // Buffer for current led painting code
	        var ledBuffer = ledBufferOff;
	
	        // Buffer for the minMeasuredValue indicator
	        var minMeasuredValueBuffer = createBuffer(minMaxIndSize, minMaxIndSize);
	        var minMeasuredValueCtx = minMeasuredValueBuffer.getContext('2d');
	
	        // Buffer for the maxMeasuredValue indicator
	        var maxMeasuredValueBuffer = createBuffer(minMaxIndSize, minMaxIndSize);
	        var maxMeasuredValueCtx = maxMeasuredValueBuffer.getContext('2d');
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(width, height);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        // **************   Image creation  ********************
	        var drawLcdText = function (ctx, value, vertical) {
	            ctx.save();
	            ctx.textAlign = 'right';
	            ctx.textBaseline = 'middle';
	            ctx.strokeStyle = lcdColor.textColor;
	            ctx.fillStyle = lcdColor.textColor;
	
	            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
	                ctx.shadowColor = 'gray';
	                if (vertical) {
	                    ctx.shadowOffsetX = imageHeight * 0.003;
	                    ctx.shadowOffsetY = imageHeight * 0.003;
	                    ctx.shadowBlur = imageHeight * 0.004;
	                } else {
	                    ctx.shadowOffsetX = imageHeight * 0.007;
	                    ctx.shadowOffsetY = imageHeight * 0.007;
	                    ctx.shadowBlur = imageHeight * 0.009;
	                }
	            }
	
	            var lcdTextX;
	            var lcdTextY;
	            var lcdTextWidth;
	
	            if (digitalFont) {
	                ctx.font = lcdFont;
	            } else {
	                ctx.font = stdFont;
	            }
	
	            if (vertical) {
	                lcdTextX = (imageWidth - (imageWidth * 0.571428)) / 2  + imageWidth * 0.571428 - 2;
	                lcdTextY = imageHeight * 0.88 + 1 + (imageHeight * 0.055 - 2) / 2;
	                lcdTextWidth = imageWidth * 0.7 - 2;
	            } else {
	                lcdTextX = (imageWidth * 0.695) + imageWidth * 0.18 - 2;
	                lcdTextY = (imageHeight * 0.22) + 1 + (imageHeight * 0.15 - 2) / 2;
	                lcdTextWidth = imageHeight * 0.22 - 2;
	            }
	
	            ctx.fillText(value.toFixed(lcdDecimals), lcdTextX, lcdTextY, lcdTextWidth);
	
	            ctx.restore();
	        };
	
	        var createThresholdImage = function (vertical) {
	            var thresholdBuffer = doc.createElement('canvas');
	            var thresholdCtx = thresholdBuffer.getContext('2d');
	            thresholdBuffer.height = thresholdBuffer.width = minMaxIndSize;
	
	            thresholdCtx.save();
	            var gradThreshold = thresholdCtx.createLinearGradient(0, 0.1, 0, thresholdBuffer.height * 0.9);
	            gradThreshold.addColorStop(0, '#520000');
	            gradThreshold.addColorStop(0.3, '#fc1d00');
	            gradThreshold.addColorStop(0.59, '#fc1d00');
	            gradThreshold.addColorStop(1, '#520000');
	            thresholdCtx.fillStyle = gradThreshold;
	
	            if (vertical) {
	                thresholdCtx.beginPath();
	                thresholdCtx.moveTo(0.1, thresholdBuffer.height * 0.5);
	                thresholdCtx.lineTo(thresholdBuffer.width * 0.9, 0.1);
	                thresholdCtx.lineTo(thresholdBuffer.width * 0.9, thresholdBuffer.height * 0.9);
	                thresholdCtx.closePath();
	            } else {
	                thresholdCtx.beginPath();
	                thresholdCtx.moveTo(0.1, 0.1);
	                thresholdCtx.lineTo(thresholdBuffer.width * 0.9, 0.1);
	                thresholdCtx.lineTo(thresholdBuffer.width * 0.5, thresholdBuffer.height * 0.9);
	                thresholdCtx.closePath();
	            }
	
	            thresholdCtx.fill();
	            thresholdCtx.strokeStyle = '#FFFFFF';
	            thresholdCtx.stroke();
	
	            thresholdCtx.restore();
	
	            return thresholdBuffer;
	        };
	
	        var drawTickmarksImage = function (ctx, labelNumberFormat, vertical) {
	            backgroundColor.labelColor.setAlpha(1);
	            ctx.save();
	            ctx.textBaseline = 'middle';
	            var TEXT_WIDTH = imageWidth * 0.1;
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	
	            var valueCounter = minValue;
	            var majorTickCounter = maxNoOfMinorTicks - 1;
	            var tickCounter;
	            var currentPos;
	            var scaleBoundsX;
	            var scaleBoundsY;
	            var scaleBoundsW;
	            var scaleBoundsH;
	            var tickSpaceScaling = 1;
	
	            var minorTickStart;
	            var minorTickStop;
	            var mediumTickStart;
	            var mediumTickStop;
	            var majorTickStart;
	            var majorTickStop;
	            if (vertical) {
	                minorTickStart = (0.34 * imageWidth);
	                minorTickStop = (0.36 * imageWidth);
	                mediumTickStart = (0.33 * imageWidth);
	                mediumTickStop = (0.36 * imageWidth);
	                majorTickStart = (0.32 * imageWidth);
	                majorTickStop = (0.36 * imageWidth);
	                ctx.textAlign = 'right';
	                scaleBoundsX = 0;
	                scaleBoundsY = imageHeight * 0.128640;
	                scaleBoundsW = 0;
	                if (gaugeType.type === 'type1') {
	                    scaleBoundsH = (imageHeight * 0.856796 - imageHeight * 0.128640);
	                } else {
	                    scaleBoundsH = (imageHeight * 0.7475 - imageHeight * 0.128640);
	                }
	                tickSpaceScaling = scaleBoundsH / (maxValue - minValue);
	            } else {
	                minorTickStart = (0.65 * imageHeight);
	                minorTickStop = (0.63 * imageHeight);
	                mediumTickStart = (0.66 * imageHeight);
	                mediumTickStop = (0.63 * imageHeight);
	                majorTickStart = (0.67 * imageHeight);
	                majorTickStop = (0.63 * imageHeight);
	                ctx.textAlign = 'center';
	                scaleBoundsY = 0;
	                if (gaugeType.type === 'type1') {
	                    scaleBoundsX = imageWidth * 0.142857;
	                    scaleBoundsW = (imageWidth * 0.871012 - scaleBoundsX);
	                } else {
	                    scaleBoundsX = imageWidth * 0.19857;
	                    scaleBoundsW = (imageWidth * 0.82 - scaleBoundsX);
	                }
	                scaleBoundsH = 0;
	                tickSpaceScaling = scaleBoundsW / (maxValue - minValue);
	            }
	
	            var labelCounter;
	            for (labelCounter = minValue, tickCounter = 0; labelCounter <= maxValue; labelCounter += minorTickSpacing, tickCounter += minorTickSpacing) {
	
	                // Calculate the bounds of the scaling
	                if (vertical) {
	                    currentPos = scaleBoundsY + scaleBoundsH - tickCounter * tickSpaceScaling;
	                } else {
	                    currentPos = scaleBoundsX + tickCounter * tickSpaceScaling;
	                }
	
	                majorTickCounter++;
	
	                // Draw tickmark every major tickmark spacing
	                if (majorTickCounter === maxNoOfMinorTicks) {
	
	                    // Draw the major tickmarks
	                    ctx.lineWidth = 1.5;
	                    drawLinearTicks(ctx, majorTickStart, majorTickStop, currentPos, vertical);
	
	                    // Draw the standard tickmark labels
	                    if (vertical) {
	                        // Vertical orientation
	                        switch (labelNumberFormat.format) {
	                        case 'fractional':
	                            ctx.fillText((valueCounter.toFixed(2)), imageWidth * 0.28, currentPos, TEXT_WIDTH);
	                            break;
	
	                        case 'scientific':
	                            ctx.fillText((valueCounter.toPrecision(2)), imageWidth * 0.28, currentPos, TEXT_WIDTH);
	                            break;
	
	                        case 'standard':
	                        /* falls through */
	                        default:
	                            ctx.fillText((valueCounter.toFixed(0)), imageWidth * 0.28, currentPos, TEXT_WIDTH);
	                            break;
	                        }
	                    } else {
	                        // Horizontal orientation
	                        switch (labelNumberFormat.format) {
	                        case 'fractional':
	                            ctx.fillText((valueCounter.toFixed(2)), currentPos, (imageHeight * 0.73), TEXT_WIDTH);
	                            break;
	
	                        case 'scientific':
	                            ctx.fillText((valueCounter.toPrecision(2)), currentPos, (imageHeight * 0.73), TEXT_WIDTH);
	                            break;
	
	                        case 'standard':
	                        /* falls through */
	                        default:
	                            ctx.fillText((valueCounter.toFixed(0)), currentPos, (imageHeight * 0.73), TEXT_WIDTH);
	                            break;
	                        }
	                    }
	
	                    valueCounter += majorTickSpacing;
	                    majorTickCounter = 0;
	                    continue;
	                }
	
	                // Draw tickmark every minor tickmark spacing
	                if (0 === maxNoOfMinorTicks % 2 && majorTickCounter === (maxNoOfMinorTicks / 2)) {
	                    ctx.lineWidth = 1;
	                    drawLinearTicks(ctx, mediumTickStart, mediumTickStop, currentPos, vertical);
	                } else {
	                    ctx.lineWidth = 0.5;
	                    drawLinearTicks(ctx, minorTickStart, minorTickStop, currentPos, vertical);
	                }
	            }
	
	            ctx.restore();
	        };
	
	        var drawLinearTicks = function (ctx, tickStart, tickStop, currentPos, vertical) {
	            if (vertical) {
	                // Vertical orientation
	                ctx.beginPath();
	                ctx.moveTo(tickStart, currentPos);
	                ctx.lineTo(tickStop, currentPos);
	                ctx.closePath();
	                ctx.stroke();
	            } else {
	                // Horizontal orientation
	                ctx.beginPath();
	                ctx.moveTo(currentPos, tickStart);
	                ctx.lineTo(currentPos, tickStop);
	                ctx.closePath();
	                ctx.stroke();
	            }
	        };
	
	        // **************   Initialization  ********************
	        var init = function (parameters) {
	            parameters = parameters || {};
	            var drawFrame = (undefined === parameters.frame ? false : parameters.frame);
	            var drawBackground = (undefined === parameters.background ? false : parameters.background);
	            var drawLed = (undefined === parameters.led ? false : parameters.led);
	            var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
	
	            var yOffset;
	            var yRange;
	            var valuePos;
	
	            initialized = true;
	
	            // Calculate the current min and max values and the range
	            calculate();
	
	            // Create frame in frame buffer (backgroundBuffer)
	            if (drawFrame && frameVisible) {
	                drawLinearFrameImage(frameContext, frameDesign, imageWidth, imageHeight, vertical);
	            }
	
	            // Create background in background buffer (backgroundBuffer)
	            if (drawBackground && backgroundVisible) {
	                drawLinearBackgroundImage(backgroundContext, backgroundColor, imageWidth, imageHeight, vertical);
	            }
	
	            // draw Thermometer outline
	            if (drawBackground && gaugeType.type === 'type2') {
	                drawBackgroundImage(backgroundContext);
	            }
	
	            if (drawLed) {
	                if (vertical) {
	                    // Draw LED ON in ledBuffer_ON
	                    ledContextOn.drawImage(createLedImage(ledSize, 1, ledColor), 0, 0);
	
	                    // Draw LED ON in ledBuffer_OFF
	                    ledContextOff.drawImage(createLedImage(ledSize, 0, ledColor), 0, 0);
	                } else {
	                    // Draw LED ON in ledBuffer_ON
	                    ledContextOn.drawImage(createLedImage(ledSize, 1, ledColor), 0, 0);
	
	                    // Draw LED ON in ledBuffer_OFF
	                    ledContextOff.drawImage(createLedImage(ledSize, 0, ledColor), 0, 0);
	                }
	            }
	
	            // Draw min measured value indicator in minMeasuredValueBuffer
	            if (minMeasuredValueVisible) {
	                if (vertical) {
	                    minMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.BLUE.dark.getRgbaColor(), false, vertical), 0, 0);
	                } else {
	                    minMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.BLUE.dark.getRgbaColor(), false, vertical), 0, 0);
	                }
	            }
	
	            // Draw max measured value indicator in maxMeasuredValueBuffer
	            if (maxMeasuredValueVisible) {
	                if (vertical) {
	                    maxMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.RED.medium.getRgbaColor(), false, vertical), 0, 0);
	                } else {
	                    maxMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.RED.medium.getRgbaColor(), false, vertical), 0, 0);
	                }
	            }
	
	            // Create alignment posts in background buffer (backgroundBuffer)
	            if (drawBackground && backgroundVisible) {
	
	                // Create tickmarks in background buffer (backgroundBuffer)
	                drawTickmarksImage(backgroundContext, labelNumberFormat, vertical);
	
	                // Create title in background buffer (backgroundBuffer)
	                if (vertical) {
	                    drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, null, lcdVisible, gaugeType);
	                } else {
	                    drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, null, lcdVisible, gaugeType);
	                }
	            }
	
	            // Draw threshold image to background context
	            if (drawBackground && thresholdVisible) {
	                backgroundContext.save();
	                if (vertical) {
	                    // Vertical orientation
	                    yOffset = (gaugeType.type === 'type1' ? 0.856796 : 0.7475);
	                    yRange = yOffset - 0.128640;
	                    valuePos = imageHeight * yOffset - (imageHeight * yRange) * (threshold - minValue) / (maxValue - minValue);
	                    backgroundContext.translate(imageWidth * 0.365, valuePos - minMaxIndSize / 2);
	                } else {
	                    // Horizontal orientation
	                    yOffset = (gaugeType.type === 'type1' ? 0.871012 : 0.82);
	                    yRange = yOffset - (gaugeType.type === 'type1' ? 0.142857 : 0.19857);
	                    valuePos = imageWidth * yRange * (threshold - minValue) / (maxValue - minValue);
	                    backgroundContext.translate(imageWidth * (gaugeType.type === 'type1' ? 0.142857 : 0.19857) - minMaxIndSize / 2 + valuePos, imageHeight * 0.58);
	                }
	                backgroundContext.drawImage(createThresholdImage(vertical), 0, 0);
	                backgroundContext.restore();
	            }
	
	            // Create lcd background if selected in background buffer (backgroundBuffer)
	            if (drawBackground && lcdVisible) {
	                if (vertical) {
	                    lcdBuffer = createLcdBackgroundImage(imageWidth * 0.571428, imageHeight * 0.055, lcdColor);
	                    backgroundContext.drawImage(lcdBuffer, ((imageWidth - (imageWidth * 0.571428)) / 2), imageHeight * 0.88);
	                } else {
	                    lcdBuffer = createLcdBackgroundImage(imageWidth * 0.18, imageHeight * 0.15, lcdColor);
	                    backgroundContext.drawImage(lcdBuffer, imageWidth * 0.695, imageHeight * 0.22);
	                }
	            }
	
	            // add thermometer stem foreground
	            if (drawForeground && gaugeType.type === 'type2') {
	                drawForegroundImage(foregroundContext);
	            }
	
	            // Create foreground in foreground buffer (foregroundBuffer)
	            if (drawForeground && foregroundVisible) {
	                drawLinearForegroundImage(foregroundContext, imageWidth, imageHeight, vertical, false);
	            }
	        };
	
	        var resetBuffers = function (buffers) {
	            buffers = buffers || {};
	            var resetFrame = (undefined === buffers.frame ? false : buffers.frame);
	            var resetBackground = (undefined === buffers.background ? false : buffers.background);
	            var resetLed = (undefined === buffers.led ? false : buffers.led);
	            var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);
	
	            if (resetFrame) {
	                frameBuffer.width = width;
	                frameBuffer.height = height;
	                frameContext = frameBuffer.getContext('2d');
	            }
	
	            if (resetBackground) {
	                backgroundBuffer.width = width;
	                backgroundBuffer.height = height;
	                backgroundContext = backgroundBuffer.getContext('2d');
	            }
	
	            if (resetLed) {
	                ledBufferOn.width = Math.ceil(width * 0.093457);
	                ledBufferOn.height = Math.ceil(height * 0.093457);
	                ledContextOn = ledBufferOn.getContext('2d');
	
	                ledBufferOff.width = Math.ceil(width * 0.093457);
	                ledBufferOff.height = Math.ceil(height * 0.093457);
	                ledContextOff = ledBufferOff.getContext('2d');
	
	                // Buffer for current led painting code
	                ledBuffer = ledBufferOff;
	            }
	
	            if (resetForeground) {
	                foregroundBuffer.width = width;
	                foregroundBuffer.height = height;
	                foregroundContext = foregroundBuffer.getContext('2d');
	            }
	        };
	
	        var blink = function (blinking) {
	            if (blinking) {
	                ledTimerId = setInterval(toggleAndRepaintLed, 1000);
	            } else {
	                clearInterval(ledTimerId);
	                ledBuffer = ledBufferOff;
	            }
	        };
	
	        var toggleAndRepaintLed = function () {
	            if (ledVisible) {
	                if (ledBuffer === ledBufferOn) {
	                    ledBuffer = ledBufferOff;
	                } else {
	                    ledBuffer = ledBufferOn;
	                }
	                if (!repainting) {
	                    repainting = true;
	                    requestAnimFrame(self.repaint);
	                }
	            }
	        };
	
	        var drawValue = function (ctx, imageWidth, imageHeight) {
	            var top; // position of max value
	            var bottom; // position of min value
	            var labelColor = backgroundColor.labelColor;
	            var fullSize;
	            var valueSize, valueTop;
	            var valueStartX, valueStartY, valueStopX, valueStopY;
	            var valueBackgroundStartX, valueBackgroundStartY, valueBackgroundStopX, valueBackgroundStopY;
	            var valueBorderStartX, valueBorderStartY, valueBorderStopX, valueBorderStopY;
	            var valueForegroundStartX, valueForegroundStartY, valueForegroundStopX, valueForegroundStopY;
	
	            // Orientation dependend definitions
	            if (vertical) {
	                // Vertical orientation
	                top =  imageHeight * 0.128640; // position of max value
	                if (gaugeType.type === 'type1') {
	                    bottom = imageHeight * 0.856796; // position of min value
	                } else {
	                    bottom = imageHeight * 0.7475;
	                }
	                fullSize = bottom - top;
	                valueSize = fullSize * (value - minValue) / (maxValue - minValue);
	                valueTop = bottom - valueSize;
	                valueBackgroundStartX = 0;
	                valueBackgroundStartY = top;
	                valueBackgroundStopX = 0;
	                valueBackgroundStopY = bottom;
	            } else {
	                // Horizontal orientation
	                if (gaugeType.type === 'type1') {
	                    top = imageWidth * 0.871012; // position of max value
	                    bottom = imageWidth * 0.142857; // position of min value
	                } else {
	                    top = imageWidth * 0.82; // position of max value
	                    bottom = imageWidth * 0.19857; // position of min value
	                }
	                fullSize = top - bottom;
	                valueSize = fullSize * (value - minValue) / (maxValue - minValue);
	                valueTop = bottom;
	                valueBackgroundStartX = top;
	                valueBackgroundStartY = 0;
	                valueBackgroundStopX = bottom;
	                valueBackgroundStopY = 0;
	            }
	            if (gaugeType.type === 'type1') {
	                var darker = (backgroundColor === steelseries.BackgroundColor.CARBON ||
	                              backgroundColor === steelseries.BackgroundColor.PUNCHED_SHEET ||
	                              backgroundColor === steelseries.BackgroundColor.STAINLESS ||
	                              backgroundColor === steelseries.BackgroundColor.BRUSHED_STAINLESS ||
	                              backgroundColor === steelseries.BackgroundColor.TURNED) ? 0.3 : 0;
	                var valueBackgroundTrackGradient = ctx.createLinearGradient(valueBackgroundStartX, valueBackgroundStartY, valueBackgroundStopX, valueBackgroundStopY);
	                labelColor.setAlpha(0.05 + darker);
	                valueBackgroundTrackGradient.addColorStop(0, labelColor.getRgbaColor());
	                labelColor.setAlpha(0.15 + darker);
	                valueBackgroundTrackGradient.addColorStop(0.48, labelColor.getRgbaColor());
	                labelColor.setAlpha(0.15 + darker);
	                valueBackgroundTrackGradient.addColorStop(0.49, labelColor.getRgbaColor());
	                labelColor.setAlpha(0.05 + darker);
	                valueBackgroundTrackGradient.addColorStop(1, labelColor.getRgbaColor());
	                ctx.fillStyle = valueBackgroundTrackGradient;
	
	                if (vertical) {
	                    ctx.fillRect(imageWidth * 0.435714, top, imageWidth * 0.142857, fullSize);
	                } else {
	                    ctx.fillRect(imageWidth * 0.142857, imageHeight * 0.435714, fullSize, imageHeight * 0.142857);
	                }
	
	                if (vertical) {
	                    // Vertical orientation
	                    valueBorderStartX = 0;
	                    valueBorderStartY = top;
	                    valueBorderStopX = 0;
	                    valueBorderStopY = top + fullSize;
	                } else {
	                    // Horizontal orientation
	                    valueBorderStartX = imageWidth * 0.142857 + fullSize;
	                    valueBorderStartY = 0;
	                    valueBorderStopX = imageWidth * 0.142857;
	                    valueBorderStopY = 0;
	                }
	                var valueBorderGradient = ctx.createLinearGradient(valueBorderStartX, valueBorderStartY, valueBorderStopX, valueBorderStopY);
	                labelColor.setAlpha(0.3 + darker);
	                valueBorderGradient.addColorStop(0, labelColor.getRgbaColor());
	                labelColor.setAlpha(0.69);
	                valueBorderGradient.addColorStop(0.48, labelColor.getRgbaColor());
	                labelColor.setAlpha(0.7);
	                valueBorderGradient.addColorStop(0.49, labelColor.getRgbaColor());
	                labelColor.setAlpha(0.4);
	                valueBorderGradient.addColorStop(1, labelColor.getRgbaColor());
	                ctx.fillStyle = valueBorderGradient;
	                if (vertical) {
	                    ctx.fillRect(imageWidth * 0.435714, top, imageWidth * 0.007142, fullSize);
	                    ctx.fillRect(imageWidth * 0.571428, top, imageWidth * 0.007142, fullSize);
	                } else {
	                    ctx.fillRect(imageWidth * 0.142857, imageHeight * 0.435714, fullSize, imageHeight * 0.007142);
	                    ctx.fillRect(imageWidth * 0.142857, imageHeight * 0.571428, fullSize, imageHeight * 0.007142);
	                }
	            }
	            if (vertical) {
	                // Vertical orientation
	                if (gaugeType.type === 'type1') {
	                    valueStartX = imageWidth * 0.45;
	                    valueStartY = 0;
	                    valueStopX = imageWidth * 0.45 + imageWidth * 0.114285;
	                    valueStopY = 0;
	                } else {
	                    valueStartX = imageWidth / 2 - imageHeight * 0.0486 / 2;
	                    valueStartY = 0;
	                    valueStopX = valueStartX + imageHeight * 0.053;
	                    valueStopY = 0;
	                }
	            } else {
	                // Horizontal orientation
	                if (gaugeType.type === 'type1') {
	                    valueStartX = 0;
	                    valueStartY = imageHeight * 0.45;
	                    valueStopX = 0;
	                    valueStopY = imageHeight * 0.45 + imageHeight * 0.114285;
	                } else {
	                    valueStartX = 0;
	                    valueStartY = imageHeight / 2 - imageWidth * 0.0250;
	                    valueStopX = 0;
	                    valueStopY = valueStartY + imageWidth * 0.053;
	                }
	            }
	
	            var valueBackgroundGradient = ctx.createLinearGradient(valueStartX, valueStartY, valueStopX, valueStopY);
	            valueBackgroundGradient.addColorStop(0, valueColor.medium.getRgbaColor());
	            valueBackgroundGradient.addColorStop(1, valueColor.light.getRgbaColor());
	            ctx.fillStyle = valueBackgroundGradient;
	            var thermoTweak = (gaugeType.type === 'type1' ? 0 : (vertical ? imageHeight * 0.05 : imageWidth * 0.05));
	            if (vertical) {
	                ctx.fillRect(valueStartX, valueTop, valueStopX - valueStartX, valueSize + thermoTweak);
	            } else {
	                ctx.fillRect(valueTop - thermoTweak, valueStartY, valueSize + thermoTweak, valueStopY - valueStartY);
	            }
	
	            if (gaugeType.type === 'type1') {
	                // The light effect on the value
	                if (vertical) {
	                    // Vertical orientation
	                    valueForegroundStartX = imageWidth * 0.45;
	                    valueForegroundStartY = 0;
	                    valueForegroundStopX = valueForegroundStartX + imageWidth * 0.05;
	                    valueForegroundStopY = 0;
	                } else {
	                    // Horizontal orientation
	                    valueForegroundStartX = 0;
	                    valueForegroundStartY = imageHeight * 0.45;
	                    valueForegroundStopX = 0;
	                    valueForegroundStopY = valueForegroundStartY + imageHeight * 0.05;
	                }
	                var valueForegroundGradient = ctx.createLinearGradient(valueForegroundStartX, valueForegroundStartY, valueForegroundStopX, valueForegroundStopY);
	                valueForegroundGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
	                valueForegroundGradient.addColorStop(0.98, 'rgba(255, 255, 255, 0.0)');
	                ctx.fillStyle = valueForegroundGradient;
	                if (vertical) {
	                    ctx.fillRect(valueForegroundStartX, valueTop, valueForegroundStopX, valueSize);
	                } else {
	                    ctx.fillRect(valueTop, valueForegroundStartY, valueSize, valueForegroundStopY - valueForegroundStartY);
	                }
	            }
	        };
	
	        var drawForegroundImage = function (ctx) {
	            var foreSize = (vertical ? imageHeight : imageWidth);
	
	            ctx.save();
	            if (vertical) {
	                ctx.translate(imageWidth / 2, 0);
	            } else {
	                ctx.translate(imageWidth / 2, imageHeight / 2);
	                ctx.rotate(HALF_PI);
	                ctx.translate(0, -imageWidth / 2 + imageWidth * 0.05);
	            }
	
	            // draw bulb
	            ctx.beginPath();
	            ctx.moveTo(-0.0490 * foreSize, 0.825 * foreSize);
	            ctx.bezierCurveTo(-0.0490 * foreSize, 0.7975 * foreSize, -0.0264 * foreSize, 0.775 * foreSize, 0.0013 * foreSize, 0.775 * foreSize);
	            ctx.bezierCurveTo(0.0264 * foreSize, 0.775 * foreSize, 0.0490 * foreSize, 0.7975 * foreSize, 0.0490 * foreSize, 0.825 * foreSize);
	            ctx.bezierCurveTo(0.0490 * foreSize, 0.85 * foreSize, 0.0264 * foreSize, 0.8725 * foreSize, 0.0013 * foreSize, 0.8725 * foreSize);
	            ctx.bezierCurveTo(-0.0264 * foreSize, 0.8725 * foreSize, -0.0490 * foreSize, 0.85 * foreSize, -0.0490 * foreSize, 0.825 * foreSize);
	            ctx.closePath();
	            var grad = ctx.createRadialGradient(0 * foreSize, 0.825 * foreSize, 0, 0 * foreSize, 0.825 * foreSize, 0.0490 * foreSize);
	            grad.addColorStop(0, valueColor.medium.getRgbaColor());
	            grad.addColorStop(0.3, valueColor.medium.getRgbaColor());
	            grad.addColorStop(1, valueColor.light.getRgbaColor());
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // draw bulb highlight
	            ctx.beginPath();
	            if (vertical) {
	                ctx.moveTo(-0.0365 * foreSize, 0.8075 * foreSize);
	                ctx.bezierCurveTo(-0.0365 * foreSize, 0.7925 * foreSize, -0.0214 * foreSize, 0.7875 * foreSize, -0.0214 * foreSize, 0.7825 * foreSize);
	                ctx.bezierCurveTo(0.0189 * foreSize, 0.785 * foreSize, 0.0365 * foreSize, 0.7925 * foreSize, 0.0365 * foreSize, 0.8075 * foreSize);
	                ctx.bezierCurveTo(0.0365 * foreSize, 0.8175 * foreSize, 0.0214 * foreSize, 0.815 * foreSize, 0.0013 * foreSize, 0.8125 * foreSize);
	                ctx.bezierCurveTo(-0.0189 * foreSize, 0.8125 * foreSize, -0.0365 * foreSize, 0.8175 * foreSize, -0.0365 * foreSize, 0.8075 * foreSize);
	                grad = ctx.createRadialGradient(0, 0.8 * foreSize, 0, 0, 0.8 * foreSize, 0.0377 * foreSize);
	            } else {
	                ctx.beginPath();
	                ctx.moveTo(-0.0214 * foreSize, 0.86 * foreSize);
	                ctx.bezierCurveTo(-0.0365 * foreSize, 0.86 * foreSize, -0.0415 * foreSize, 0.845 * foreSize, -0.0465 * foreSize, 0.825 * foreSize);
	                ctx.bezierCurveTo(-0.0465 * foreSize, 0.805 * foreSize, -0.0365 * foreSize, 0.7875 * foreSize, -0.0214 * foreSize, 0.7875 * foreSize);
	                ctx.bezierCurveTo(-0.0113 * foreSize, 0.7875 * foreSize, -0.0163 * foreSize, 0.8025 * foreSize, -0.0163 * foreSize, 0.8225 * foreSize);
	                ctx.bezierCurveTo(-0.0163 * foreSize, 0.8425 * foreSize, -0.0113 * foreSize, 0.86 * foreSize, -0.0214 * foreSize, 0.86 * foreSize);
	                grad = ctx.createRadialGradient(-0.03 * foreSize, 0.8225 * foreSize, 0, -0.03 * foreSize, 0.8225 * foreSize, 0.0377 * foreSize);
	            }
	            grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.55)');
	            grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.05)');
	            ctx.fillStyle = grad;
	            ctx.closePath();
	            ctx.fill();
	
	            // stem highlight
	            ctx.beginPath();
	            ctx.moveTo(-0.0214 * foreSize, 0.115 * foreSize);
	            ctx.bezierCurveTo(-0.0214 * foreSize, 0.1075 * foreSize, -0.0163 * foreSize, 0.1025 * foreSize, -0.0113 * foreSize, 0.1025 * foreSize);
	            ctx.bezierCurveTo(-0.0113 * foreSize, 0.1025 * foreSize, -0.0113 * foreSize, 0.1025 * foreSize, -0.0113 * foreSize, 0.1025 * foreSize);
	            ctx.bezierCurveTo(-0.0038 * foreSize, 0.1025 * foreSize, 0.0013 * foreSize, 0.1075 * foreSize, 0.0013 * foreSize, 0.115 * foreSize);
	            ctx.bezierCurveTo(0.0013 * foreSize, 0.115 * foreSize, 0.0013 * foreSize, 0.76 * foreSize, 0.0013 * foreSize, 0.76 * foreSize);
	            ctx.bezierCurveTo(0.0013 * foreSize, 0.7675 * foreSize, -0.0038 * foreSize, 0.7725 * foreSize, -0.0113 * foreSize, 0.7725 * foreSize);
	            ctx.bezierCurveTo(-0.0113 * foreSize, 0.7725 * foreSize, -0.0113 * foreSize, 0.7725 * foreSize, -0.0113 * foreSize, 0.7725 * foreSize);
	            ctx.bezierCurveTo(-0.0163 * foreSize, 0.7725 * foreSize, -0.0214 * foreSize, 0.7675 * foreSize, -0.0214 * foreSize, 0.76 * foreSize);
	            ctx.bezierCurveTo(-0.0214 * foreSize, 0.76 * foreSize, -0.0214 * foreSize, 0.115 * foreSize, -0.0214 * foreSize, 0.115 * foreSize);
	            ctx.closePath();
	            grad = ctx.createLinearGradient(-0.0189 * foreSize, 0, 0.0013 * foreSize, 0);
	            grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.1)');
	            grad.addColorStop(0.34, 'rgba(255, 255, 255, 0.5)');
	            grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.1)');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            ctx.restore();
	        };
	
	        var drawBackgroundImage = function (ctx) {
	            var backSize = (vertical ? imageHeight : imageWidth);
	            ctx.save();
	            if (vertical) {
	                ctx.translate(imageWidth / 2, 0);
	            } else {
	                ctx.translate(imageWidth / 2, imageHeight / 2);
	                ctx.rotate(HALF_PI);
	                ctx.translate(0, -imageWidth / 2 + imageWidth * 0.05);
	            }
	            ctx.beginPath();
	            ctx.moveTo(-0.0516 * backSize, 0.825 * backSize);
	            ctx.bezierCurveTo(-0.0516 * backSize, 0.8525 * backSize, -0.0289 * backSize, 0.875 * backSize, 0.0013 * backSize, 0.875 * backSize);
	            ctx.bezierCurveTo(0.0289 * backSize, 0.875 * backSize, 0.0516 * backSize, 0.8525 * backSize, 0.0516 * backSize, 0.825 * backSize);
	            ctx.bezierCurveTo(0.0516 * backSize, 0.8075 * backSize, 0.0440 * backSize, 0.7925 * backSize, 0.0314 * backSize, 0.7825 * backSize);
	            ctx.bezierCurveTo(0.0314 * backSize, 0.7825 * backSize, 0.0314 * backSize, 0.12 * backSize, 0.0314 * backSize, 0.12 * backSize);
	            ctx.bezierCurveTo(0.0314 * backSize, 0.1025 * backSize, 0.0189 * backSize, 0.0875 * backSize, 0.0013 * backSize, 0.0875 * backSize);
	            ctx.bezierCurveTo(-0.0163 * backSize, 0.0875 * backSize, -0.0289 * backSize, 0.1025 * backSize, -0.0289 * backSize, 0.12 * backSize);
	            ctx.bezierCurveTo(-0.0289 * backSize, 0.12 * backSize, -0.0289 * backSize, 0.7825 * backSize, -0.0289 * backSize, 0.7825 * backSize);
	            ctx.bezierCurveTo(-0.0415 * backSize, 0.79 * backSize, -0.0516 * backSize, 0.805 * backSize, -0.0516 * backSize, 0.825 * backSize);
	            ctx.closePath();
	            var grad = ctx.createLinearGradient(-0.0163 * backSize, 0, 0.0289 * backSize, 0);
	            grad.addColorStop(0, 'rgba(226, 226, 226, 0.5)');
	            grad.addColorStop(0.5, 'rgba(226, 226, 226, 0.2)');
	            grad.addColorStop(1, 'rgba(226, 226, 226, 0.5)');
	            ctx.fillStyle = grad;
	            ctx.fill();
	            ctx.lineWidth = 1;
	            ctx.strokeStyle = 'rgba(153, 153, 153, 0.5)';
	            ctx.stroke();
	            ctx.restore();
	        };
	
	        //************************************ Public methods **************************************
	        this.setValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
	            if (value !== targetValue) {
	                value = targetValue;
	
	                if (value > maxMeasuredValue) {
	                    maxMeasuredValue = value;
	                }
	                if (value < minMeasuredValue) {
	                    minMeasuredValue = value;
	                }
	
	                if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                    (value <= threshold && !ledBlinking && !thresholdRising)) {
	                    ledBlinking = true;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.play();
	                    }
	                } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                           (value > threshold && ledBlinking && !thresholdRising)) {
	                    ledBlinking = false;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.pause();
	                    }
	                }
	
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.setValueAnimated = function (newValue, callback) {
	            var targetValue,
	                gauge = this,
	                time;
	            newValue = parseFloat(newValue);
	            targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
	            if (value !== targetValue) {
	                if (undefined !== tween && tween.isPlaying) {
	                    tween.stop();
	                }
	
	                time = fullScaleDeflectionTime * Math.abs(targetValue - value) / (maxValue - minValue);
	                time = Math.max(time, fullScaleDeflectionTime / 5);
	                tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, time);
	                //tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, 1);
	
	                tween.onMotionChanged = function (event) {
	                    value = event.target._pos;
	                    if (value > maxMeasuredValue) {
	                        maxMeasuredValue = value;
	                    }
	                    if (value < minMeasuredValue) {
	                        minMeasuredValue = value;
	                    }
	
	                    if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                        (value <= threshold && !ledBlinking && !thresholdRising)) {
	                        ledBlinking = true;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.play();
	                        }
	                    } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                               (value > threshold && ledBlinking && !thresholdRising)) {
	                        ledBlinking = false;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.pause();
	                        }
	                    }
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tween.onMotionFinished = callback;
	                }
	
	                tween.start();
	            }
	            return this;
	        };
	
	        this.resetMinMeasuredValue = function () {
	            minMeasuredValue = value;
	            this.repaint();
	            return this;
	        };
	
	        this.resetMaxMeasuredValue = function () {
	            maxMeasuredValue = value;
	            this.repaint();
	            return this;
	        };
	
	        this.setMinMeasuredValueVisible = function (visible) {
	            minMeasuredValueVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setMaxMeasuredValueVisible = function (visible) {
	            maxMeasuredValueVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setThreshold = function (threshVal) {
	            threshVal = parseFloat(threshVal);
	            var targetValue = (threshVal < minValue ? minValue : (threshVal > maxValue ? maxValue : threshVal));
	            threshold = targetValue;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setThresholdVisible = function (visible) {
	            thresholdVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setThresholdRising = function (rising) {
	            thresholdRising = !!rising;
	            // reset existing threshold alerts
	            ledBlinking = !ledBlinking;
	            blink(ledBlinking);
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdDecimals = function (decimals) {
	            lcdDecimals = parseInt(decimals, 10);
	            this.repaint();
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers({frame: true});
	            frameDesign = newFrameDesign;
	            init({frame: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers({background: true});
	            backgroundColor = newBackgroundColor;
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setValueColor = function (newValueColor) {
	            resetBuffers({foreground: true});
	            valueColor = newValueColor;
	            init({foreground: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLedColor = function (newLedColor) {
	            resetBuffers({led: true});
	            ledColor = newLedColor;
	            init({led: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLedVisible = function (visible) {
	            ledVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdColor = function (newLcdColor) {
	            resetBuffers({background: true});
	            lcdColor = newLcdColor;
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setMaxMeasuredValue = function (newVal) {
	            newVal = parseFloat(newVal);
	            var targetValue = (newVal < minValue ? minValue : (newVal > maxValue ? maxValue : newVal));
	            maxMeasuredValue = targetValue;
	            this.repaint();
	            return this;
	        };
	
	        this.setMinMeasuredValue = function (newVal) {
	            newVal = parseFloat(newVal);
	            var targetValue = (newVal < minValue ? minValue : (newVal > maxValue ? maxValue : newVal));
	            minMeasuredValue = targetValue;
	            this.repaint();
	            return this;
	        };
	
	        this.setTitleString = function (title) {
	            titleString = title;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setUnitString = function (unit) {
	            unitString = unit;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setMinValue = function (newVal) {
	            resetBuffers({background: true});
	            minValue = parseFloat(newVal);
	            if (minMeasuredValue < minValue) {
	                minMeasuredValue = minValue;
	            }
	            if (value < minValue) {
	                value = minValue;
	            }
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.getMinValue = function () {
	            return minValue;
	        };
	
	        this.setMaxValue = function (newVal) {
	            resetBuffers({background: true});
	            maxValue = parseFloat(newVal);
	            if (maxMeasuredValue > maxValue) {
	                maxMeasuredValue = maxValue;
	            }
	            if (value > maxValue) {
	                value = maxValue;
	            }
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.getMaxValue = function () {
	            return maxValue;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init({frame: true,
	                      background: true,
	                      led: true,
	                      foreground: true});
	            }
	
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            // Draw frame
	            if (frameVisible) {
	                mainCtx.drawImage(frameBuffer, 0, 0);
	            }
	
	            // Draw buffered image to visible canvas
	            mainCtx.drawImage(backgroundBuffer, 0, 0);
	
	            // Draw lcd display
	            if (lcdVisible) {
	                drawLcdText(mainCtx, value, vertical);
	            }
	
	            // Draw led
	            if (ledVisible) {
	                mainCtx.drawImage(ledBuffer, ledPosX, ledPosY);
	            }
	
	            var valuePos;
	            var yOffset;
	            var yRange;
	            var minMaxX, minMaxY;
	            // Draw min measured value indicator
	            if (minMeasuredValueVisible) {
	                if (vertical) {
	                    yOffset = (gaugeType.type === 'type1' ? 0.856796 : 0.7475);
	                    yRange = (yOffset - 0.128640);
	                    valuePos = imageHeight * yOffset - (imageHeight * yRange) * (minMeasuredValue - minValue) / (maxValue - minValue);
	                    minMaxX = imageWidth * 0.34 - minMeasuredValueBuffer.width;
	                    minMaxY = valuePos - minMeasuredValueBuffer.height / 2;
	                } else {
	                    yOffset = (gaugeType.type === 'type1' ? 0.871012 : 0.82);
	                    yRange = yOffset - (gaugeType.type === 'type1' ? 0.142857 : 0.19857);
	                    valuePos = (imageWidth * yRange) * (minMeasuredValue - minValue) / (maxValue - minValue);
	                    minMaxX = imageWidth * (gaugeType.type === 'type1' ? 0.142857 : 0.19857) - minMeasuredValueBuffer.height / 2 + valuePos;
	                    minMaxY = imageHeight * 0.65;
	                }
	                mainCtx.drawImage(minMeasuredValueBuffer, minMaxX, minMaxY);
	            }
	
	            // Draw max measured value indicator
	            if (maxMeasuredValueVisible) {
	                if (vertical) {
	                    valuePos = imageHeight * yOffset - (imageHeight * yRange) * (maxMeasuredValue - minValue) / (maxValue - minValue);
	                    minMaxX = imageWidth * 0.34 - maxMeasuredValueBuffer.width;
	                    minMaxY = valuePos - maxMeasuredValueBuffer.height / 2;
	                } else {
	                    yOffset = (gaugeType.type === 'type1' ? 0.871012 : 0.8);
	                    yRange = yOffset - (gaugeType.type === 'type1' ? 0.14857 : 0.19857);
	                    valuePos = (imageWidth * yRange) * (maxMeasuredValue - minValue) / (maxValue - minValue);
	                    minMaxX = imageWidth * (gaugeType.type === 'type1' ? 0.142857 : 0.19857) - maxMeasuredValueBuffer.height / 2 + valuePos;
	                    minMaxY = imageHeight * 0.65;
	                }
	                mainCtx.drawImage(maxMeasuredValueBuffer, minMaxX, minMaxY);
	            }
	
	            mainCtx.save();
	            drawValue(mainCtx, imageWidth, imageHeight);
	            mainCtx.restore();
	
	            // Draw foreground
	            if (foregroundVisible || gaugeType.type === 'type2') {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var linearBargraph = function (canvas, parameters) {
	        parameters = parameters || {};
	        var width = (undefined === parameters.width ? 0 : parameters.width),
	            height = (undefined === parameters.height ? 0 : parameters.height),
	            minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
	            maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
	            section = (undefined === parameters.section ? null : parameters.section),
	            useSectionColors = (undefined === parameters.useSectionColors ? false : parameters.useSectionColors),
	            niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
	            threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue: parameters.threshold),
	            titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
	            unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            valueColor = (undefined === parameters.valueColor ? steelseries.ColorDef.RED : parameters.valueColor),
	            lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor),
	            lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
	            lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
	            digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
	            ledColor = (undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor),
	            ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
	            thresholdVisible = (undefined === parameters.thresholdVisible ? true : parameters.thresholdVisible),
	            thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
	            minMeasuredValueVisible = (undefined === parameters.minMeasuredValueVisible ? false : parameters.minMeasuredValueVisible),
	            maxMeasuredValueVisible = (undefined === parameters.maxMeasuredValueVisible ? false : parameters.maxMeasuredValueVisible),
	            labelNumberFormat = (undefined === parameters.labelNumberFormat ? steelseries.LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
	            alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
	            valueGradient = (undefined === parameters.valueGradient ? null : parameters.valueGradient),
	            useValueGradient = (undefined === parameters.useValueGradient ? false : parameters.useValueGradient),
	            fullScaleDeflectionTime = (undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime);
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (width === 0) {
	            width = mainCtx.canvas.width;
	        }
	        if (height === 0) {
	            height = mainCtx.canvas.height;
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = width;
	        mainCtx.canvas.height = height;
	
	        var imageWidth = width;
	        var imageHeight = height;
	
	        // Create audio tag for alarm sound
	        if (playAlarm && alarmSound !== false) {
	            var audioElement = doc.createElement('audio');
	            audioElement.setAttribute('src', alarmSound);
	            audioElement.setAttribute('preload', 'auto');
	        }
	
	        var self = this;
	        var value = minValue;
	
	        // Properties
	        var minMeasuredValue = maxValue;
	        var maxMeasuredValue = minValue;
	
	        var tween;
	        var ledBlinking = false;
	        var repainting = false;
	        var isSectionsVisible = false;
	        var isGradientVisible = false;
	        var sectionPixels = [];
	        var ledTimerId = 0;
	
	        var vertical = width <= height;
	
	        // Constants
	        var ledPosX;
	        var ledPosY;
	        var ledSize = Math.round((vertical ? height : width) * 0.05);
	        var minMaxIndSize = Math.round((vertical ? width : height) * 0.05);
	        var stdFont;
	        var lcdFont;
	
	        if (vertical) {
	            ledPosX = imageWidth / 2 - ledSize / 2;
	            ledPosY = 0.053 * imageHeight;
	            stdFont = Math.floor(imageHeight / 22) + 'px ' + stdFontName;
	            lcdFont = Math.floor(imageHeight / 22) + 'px ' + lcdFontName;
	        } else {
	            ledPosX = 0.89 * imageWidth;
	            ledPosY = imageHeight / 1.95 - ledSize / 2;
	            stdFont = Math.floor(imageHeight / 10) + 'px ' + stdFontName;
	            lcdFont = Math.floor(imageHeight / 10) + 'px ' + lcdFontName;
	        }
	
	        var initialized = false;
	
	        // Tickmark specific private variables
	        var niceMinValue = minValue;
	        var niceMaxValue = maxValue;
	        var niceRange = maxValue - minValue;
	        var range = niceMaxValue - niceMinValue;
	        var minorTickSpacing = 0;
	        var majorTickSpacing = 0;
	        var maxNoOfMinorTicks = 10;
	        var maxNoOfMajorTicks = 10;
	
	        // Method to calculate nice values for min, max and range for the tickmarks
	        var calculate = function calculate() {
	            if (niceScale) {
	                niceRange = calcNiceNumber(maxValue - minValue, false);
	                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
	                niceMinValue = Math.floor(minValue / majorTickSpacing) * majorTickSpacing;
	                niceMaxValue = Math.ceil(maxValue / majorTickSpacing) * majorTickSpacing;
	                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
	                minValue = niceMinValue;
	                maxValue = niceMaxValue;
	                range = maxValue - minValue;
	            } else {
	                niceRange = (maxValue - minValue);
	                niceMinValue = minValue;
	                niceMaxValue = maxValue;
	                range = niceRange;
	                minorTickSpacing = 1;
	                majorTickSpacing = 10;
	            }
	        };
	
	        // **************   Buffer creation  ********************
	        // Buffer for the frame
	        var frameBuffer = createBuffer(width, height);
	        var frameContext = frameBuffer.getContext('2d');
	
	        // Buffer for the background
	        var backgroundBuffer = createBuffer(width, height);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        var lcdBuffer;
	
	        // Buffer for active bargraph led
	        var activeLedBuffer = doc.createElement('canvas');
	        if (vertical) {
	            activeLedBuffer.width = imageWidth * 0.121428;
	            activeLedBuffer.height = imageHeight * 0.012135;
	        } else {
	            activeLedBuffer.width = imageWidth * 0.012135;
	            activeLedBuffer.height = imageHeight * 0.121428;
	        }
	        var activeLedContext = activeLedBuffer.getContext('2d');
	
	        // Buffer for active bargraph led
	        var inActiveLedBuffer = doc.createElement('canvas');
	        if (vertical) {
	            inActiveLedBuffer.width = imageWidth * 0.121428;
	            inActiveLedBuffer.height = imageHeight * 0.012135;
	        } else {
	            inActiveLedBuffer.width = imageWidth * 0.012135;
	            inActiveLedBuffer.height = imageHeight * 0.121428;
	        }
	        var inActiveLedContext = inActiveLedBuffer.getContext('2d');
	
	        // Buffer for led on painting code
	        var ledBufferOn = createBuffer(ledSize, ledSize);
	        var ledContextOn = ledBufferOn.getContext('2d');
	
	        // Buffer for led off painting code
	        var ledBufferOff = createBuffer(ledSize, ledSize);
	        var ledContextOff = ledBufferOff.getContext('2d');
	
	        // Buffer for current led painting code
	        var ledBuffer = ledBufferOff;
	
	        // Buffer for the minMeasuredValue indicator
	        var minMeasuredValueBuffer = createBuffer(minMaxIndSize, minMaxIndSize);
	        var minMeasuredValueCtx = minMeasuredValueBuffer.getContext('2d');
	
	        // Buffer for the maxMeasuredValue indicator
	        var maxMeasuredValueBuffer = createBuffer(minMaxIndSize, minMaxIndSize);
	        var maxMeasuredValueCtx = maxMeasuredValueBuffer.getContext('2d');
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(width, height);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        // **************   Image creation  ********************
	        var drawLcdText = function (ctx, value, vertical) {
	            ctx.save();
	            ctx.textAlign = 'right';
	            ctx.textBaseline = 'middle';
	            ctx.strokeStyle = lcdColor.textColor;
	            ctx.fillStyle = lcdColor.textColor;
	
	            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
	                ctx.shadowColor = 'gray';
	                if (vertical) {
	                    ctx.shadowOffsetX = imageWidth * 0.007;
	                    ctx.shadowOffsetY = imageWidth * 0.007;
	                    ctx.shadowBlur = imageWidth * 0.009;
	                } else {
	                    ctx.shadowOffsetX = imageHeight * 0.007;
	                    ctx.shadowOffsetY = imageHeight * 0.007;
	                    ctx.shadowBlur = imageHeight * 0.009;
	                }
	            }
	
	            var lcdTextX;
	            var lcdTextY;
	            var lcdTextWidth;
	
	            if (digitalFont) {
	                ctx.font = lcdFont;
	            } else {
	                ctx.font = stdFont;
	            }
	
	            if (vertical) {
	                lcdTextX = (imageWidth - (imageWidth * 0.571428)) / 2 + 1 + imageWidth * 0.571428 - 2;
	                lcdTextY = imageHeight * 0.88 + 1 + (imageHeight * 0.055 - 2) / 2;
	                lcdTextWidth = imageWidth * 0.7 - 2;
	            } else {
	                lcdTextX = (imageWidth * 0.695) + imageWidth * 0.18 - 2;
	                lcdTextY = (imageHeight * 0.22) + 1 + (imageHeight * 0.15 - 2) / 2;
	                lcdTextWidth = imageHeight * 0.22 - 2;
	            }
	
	            ctx.fillText(value.toFixed(lcdDecimals), lcdTextX, lcdTextY, lcdTextWidth);
	
	            ctx.restore();
	        };
	
	        var createThresholdImage = function (vertical) {
	            var thresholdBuffer = doc.createElement('canvas');
	            thresholdBuffer.height = thresholdBuffer.width = minMaxIndSize;
	            var thresholdCtx = thresholdBuffer.getContext('2d');
	
	            thresholdCtx.save();
	            var gradThreshold = thresholdCtx.createLinearGradient(0, 0.1, 0, thresholdBuffer.height * 0.9);
	            gradThreshold.addColorStop(0, '#520000');
	            gradThreshold.addColorStop(0.3, '#fc1d00');
	            gradThreshold.addColorStop(0.59, '#fc1d00');
	            gradThreshold.addColorStop(1, '#520000');
	            thresholdCtx.fillStyle = gradThreshold;
	
	            if (vertical) {
	                thresholdCtx.beginPath();
	                thresholdCtx.moveTo(0.1, thresholdBuffer.height * 0.5);
	                thresholdCtx.lineTo(thresholdBuffer.width * 0.9, 0.1);
	                thresholdCtx.lineTo(thresholdBuffer.width * 0.9, thresholdBuffer.height * 0.9);
	                thresholdCtx.closePath();
	            } else {
	                thresholdCtx.beginPath();
	                thresholdCtx.moveTo(0.1, 0.1);
	                thresholdCtx.lineTo(thresholdBuffer.width * 0.9, 0.1);
	                thresholdCtx.lineTo(thresholdBuffer.width * 0.5, thresholdBuffer.height * 0.9);
	                thresholdCtx.closePath();
	            }
	
	            thresholdCtx.fill();
	            thresholdCtx.strokeStyle = '#FFFFFF';
	            thresholdCtx.stroke();
	
	            thresholdCtx.restore();
	
	            return thresholdBuffer;
	        };
	
	        var drawTickmarksImage = function (ctx, labelNumberFormat, vertical) {
	            backgroundColor.labelColor.setAlpha(1);
	            ctx.save();
	            ctx.textBaseline = 'middle';
	            var TEXT_WIDTH = imageWidth * 0.1;
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	
	            var valueCounter = minValue;
	            var majorTickCounter = maxNoOfMinorTicks - 1;
	            var tickCounter;
	            var currentPos;
	            var scaleBoundsX;
	            var scaleBoundsY;
	            var scaleBoundsW;
	            var scaleBoundsH;
	            var tickSpaceScaling = 1;
	
	            var minorTickStart;
	            var minorTickStop;
	            var mediumTickStart;
	            var mediumTickStop;
	            var majorTickStart;
	            var majorTickStop;
	            if (vertical) {
	                minorTickStart = (0.34 * imageWidth);
	                minorTickStop = (0.36 * imageWidth);
	                mediumTickStart = (0.33 * imageWidth);
	                mediumTickStop = (0.36 * imageWidth);
	                majorTickStart = (0.32 * imageWidth);
	                majorTickStop = (0.36 * imageWidth);
	                ctx.textAlign = 'right';
	                scaleBoundsX = 0;
	                scaleBoundsY = imageHeight * 0.128640;
	                scaleBoundsW = 0;
	                scaleBoundsH = (imageHeight * 0.856796 - imageHeight * 0.128640);
	                tickSpaceScaling = scaleBoundsH / (maxValue - minValue);
	            } else {
	                minorTickStart = (0.65 * imageHeight);
	                minorTickStop = (0.63 * imageHeight);
	                mediumTickStart = (0.66 * imageHeight);
	                mediumTickStop = (0.63 * imageHeight);
	                majorTickStart = (0.67 * imageHeight);
	                majorTickStop = (0.63 * imageHeight);
	                ctx.textAlign = 'center';
	                scaleBoundsX = imageWidth * 0.142857;
	                scaleBoundsY = 0;
	                scaleBoundsW = (imageWidth * 0.871012 - imageWidth * 0.142857);
	                scaleBoundsH = 0;
	                tickSpaceScaling = scaleBoundsW / (maxValue - minValue);
	            }
	
	            var labelCounter;
	            for (labelCounter = minValue, tickCounter = 0; labelCounter <= maxValue; labelCounter += minorTickSpacing, tickCounter += minorTickSpacing) {
	
	                // Calculate the bounds of the scaling
	                if (vertical) {
	                    currentPos = scaleBoundsY + scaleBoundsH - tickCounter * tickSpaceScaling;
	                } else {
	                    currentPos = scaleBoundsX + tickCounter * tickSpaceScaling;
	                }
	
	                majorTickCounter++;
	
	                // Draw tickmark every major tickmark spacing
	                if (majorTickCounter === maxNoOfMinorTicks) {
	
	                    // Draw the major tickmarks
	                    ctx.lineWidth = 1.5;
	                    drawLinearTicks(ctx, majorTickStart, majorTickStop, currentPos, vertical);
	
	                    // Draw the standard tickmark labels
	                    if (vertical) {
	                        // Vertical orientation
	                        switch (labelNumberFormat.format) {
	                        case 'fractional':
	                            ctx.fillText((valueCounter.toFixed(2)), imageWidth * 0.28, currentPos, TEXT_WIDTH);
	                            break;
	
	                        case 'scientific':
	                            ctx.fillText((valueCounter.toPrecision(2)), imageWidth * 0.28, currentPos, TEXT_WIDTH);
	                            break;
	
	                        case 'standard':
	                        /* falls through */
	                        default:
	                            ctx.fillText((valueCounter.toFixed(0)), imageWidth * 0.28, currentPos, TEXT_WIDTH);
	                            break;
	                        }
	                    } else {
	                        // Horizontal orientation
	                        switch (labelNumberFormat.format) {
	                        case 'fractional':
	                            ctx.fillText((valueCounter.toFixed(2)), currentPos, (imageHeight * 0.73), TEXT_WIDTH);
	                            break;
	
	                        case 'scientific':
	                            ctx.fillText((valueCounter.toPrecision(2)), currentPos, (imageHeight * 0.73), TEXT_WIDTH);
	                            break;
	
	                        case 'standard':
	                        /* falls through */
	                        default:
	                            ctx.fillText((valueCounter.toFixed(0)), currentPos, (imageHeight * 0.73), TEXT_WIDTH);
	                            break;
	                        }
	                    }
	
	                    valueCounter += majorTickSpacing;
	                    majorTickCounter = 0;
	                    continue;
	                }
	
	                // Draw tickmark every minor tickmark spacing
	                if (0 === maxNoOfMinorTicks % 2 && majorTickCounter === (maxNoOfMinorTicks / 2)) {
	                    ctx.lineWidth = 1;
	                    drawLinearTicks(ctx, mediumTickStart, mediumTickStop, currentPos, vertical);
	                } else {
	                    ctx.lineWidth = 0.5;
	                    drawLinearTicks(ctx, minorTickStart, minorTickStop, currentPos, vertical);
	                }
	            }
	
	            ctx.restore();
	        };
	
	        var drawLinearTicks = function (ctx, tickStart, tickStop, currentPos, vertical) {
	            if (vertical) {
	                // Vertical orientation
	                ctx.beginPath();
	                ctx.moveTo(tickStart, currentPos);
	                ctx.lineTo(tickStop, currentPos);
	                ctx.closePath();
	                ctx.stroke();
	            } else {
	                // Horizontal orientation
	                ctx.beginPath();
	                ctx.moveTo(currentPos, tickStart);
	                ctx.lineTo(currentPos, tickStop);
	                ctx.closePath();
	                ctx.stroke();
	            }
	        };
	
	        // **************   Initialization  ********************
	        var init = function (parameters) {
	            parameters = parameters || {};
	            var drawFrame = (undefined === parameters.frame ? false : parameters.frame);
	            var drawBackground = (undefined === parameters.background ? false : parameters.background);
	            var drawLed = (undefined === parameters.led ? false : parameters.led);
	            var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
	            var drawBargraphLed = (undefined === parameters.bargraphled ? false : parameters.bargraphled);
	
	            initialized = true;
	
	            // Calculate the current min and max values and the range
	            calculate();
	
	            // Create frame in frame buffer (backgroundBuffer)
	            if (drawFrame && frameVisible) {
	                drawLinearFrameImage(frameContext, frameDesign, imageWidth, imageHeight, vertical);
	            }
	
	            // Create background in background buffer (backgroundBuffer)
	            if (drawBackground && backgroundVisible) {
	                drawLinearBackgroundImage(backgroundContext, backgroundColor, imageWidth, imageHeight, vertical);
	            }
	
	            if (drawLed) {
	                if (vertical) {
	                    // Draw LED ON in ledBuffer_ON
	                    ledContextOn.drawImage(createLedImage(ledSize, 1, ledColor), 0, 0);
	
	                    // Draw LED ON in ledBuffer_OFF
	                    ledContextOff.drawImage(createLedImage(ledSize, 0, ledColor), 0, 0);
	                } else {
	                    // Draw LED ON in ledBuffer_ON
	                    ledContextOn.drawImage(createLedImage(ledSize, 1, ledColor), 0, 0);
	
	                    // Draw LED ON in ledBuffer_OFF
	                    ledContextOff.drawImage(createLedImage(ledSize, 0, ledColor), 0, 0);
	                }
	            }
	
	            // Draw min measured value indicator in minMeasuredValueBuffer
	            if (minMeasuredValueVisible) {
	                if (vertical) {
	                    minMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.BLUE.dark.getRgbaColor(), false, vertical), 0, 0);
	                } else {
	                    minMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.BLUE.dark.getRgbaColor(), false, vertical), 0, 0);
	                }
	            }
	
	            // Draw max measured value indicator in maxMeasuredValueBuffer
	            if (maxMeasuredValueVisible) {
	                if (vertical) {
	                    maxMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.RED.medium.getRgbaColor(), false, vertical), 0, 0);
	                } else {
	                    maxMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.RED.medium.getRgbaColor(), false, vertical), 0, 0);
	                }
	            }
	
	            // Create alignment posts in background buffer (backgroundBuffer)
	            if (drawBackground && backgroundVisible) {
	                var valuePos;
	                // Create tickmarks in background buffer (backgroundBuffer)
	                drawTickmarksImage(backgroundContext, labelNumberFormat, vertical);
	
	                // Draw threshold image to background context
	                if (thresholdVisible) {
	                    backgroundContext.save();
	                    if (vertical) {
	                        // Vertical orientation
	                        valuePos = imageHeight * 0.856796 - (imageHeight * 0.728155) * (threshold - minValue) / (maxValue - minValue);
	                        backgroundContext.translate(imageWidth * 0.365, valuePos - minMaxIndSize / 2);
	                    } else {
	                        // Horizontal orientation
	                        valuePos = (imageWidth * 0.856796 - imageWidth * 0.128640) * (threshold - minValue) / (maxValue - minValue);
	                        backgroundContext.translate(imageWidth * 0.142857 - minMaxIndSize / 2 + valuePos, imageHeight * 0.58);
	                    }
	                    backgroundContext.drawImage(createThresholdImage(vertical), 0, 0);
	                    backgroundContext.restore();
	                }
	
	                // Create title in background buffer (backgroundBuffer)
	                if (vertical) {
	                    drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, null, lcdVisible);
	                } else {
	                    drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, null, lcdVisible);
	                }
	            }
	
	            // Create lcd background if selected in background buffer (backgroundBuffer)
	            if (drawBackground && lcdVisible) {
	                if (vertical) {
	                    lcdBuffer = createLcdBackgroundImage(imageWidth * 0.571428, imageHeight * 0.055, lcdColor);
	                    backgroundContext.drawImage(lcdBuffer, ((imageWidth - (imageWidth * 0.571428)) / 2), imageHeight * 0.88);
	                } else {
	                    lcdBuffer = createLcdBackgroundImage(imageWidth * 0.18, imageHeight * 0.15, lcdColor);
	                    backgroundContext.drawImage(lcdBuffer, imageWidth * 0.695, imageHeight * 0.22);
	                }
	            }
	
	            // Draw leds of bargraph
	            if (drawBargraphLed) {
	                drawInActiveLed(inActiveLedContext);
	                drawActiveLed(activeLedContext, valueColor);
	            }
	
	            // Convert Section values into pixels
	            isSectionsVisible = false;
	            if (null !== section && 0 < section.length) {
	                isSectionsVisible = true;
	                var sectionIndex = section.length;
	                var top, bottom, fullSize, ledWidth2;
	
	                if (vertical) {
	                    // Vertical orientation
	                    top =  imageHeight * 0.128640; // position of max value
	                    bottom = imageHeight * 0.856796; // position of min value
	                    fullSize = bottom - top;
	                    ledWidth2 = 0;
	                } else {
	                    // Horizontal orientation
	                    top = imageWidth * 0.856796; // position of max value
	                    bottom = imageWidth * 0.128640;
	                    fullSize = top - bottom;
	                    ledWidth2 = imageWidth * 0.012135 / 2;
	                }
	                sectionPixels = [];
	                do {
	                    sectionIndex--;
	                    sectionPixels.push({start: (((section[sectionIndex].start + Math.abs(minValue)) / (maxValue - minValue)) * fullSize - ledWidth2),
	                                         stop: (((section[sectionIndex].stop + Math.abs(minValue)) / (maxValue - minValue)) * fullSize - ledWidth2),
	                                        color: customColorDef(section[sectionIndex].color)});
	                } while (0 < sectionIndex);
	            }
	
	            // Use a gradient for the valueColor?
	            isGradientVisible = false;
	            if (useValueGradient && valueGradient !== null) {
	                // force section colors off!
	                isSectionsVisible = false;
	                isGradientVisible = true;
	            }
	
	            // Create foreground in foreground buffer (foregroundBuffer)
	            if (drawForeground && foregroundVisible) {
	                drawLinearForegroundImage(foregroundContext, imageWidth, imageHeight, vertical, false);
	            }
	        };
	
	        var resetBuffers = function (buffers) {
	            buffers = buffers || {};
	            var resetFrame = (undefined === buffers.frame ? false : buffers.frame);
	            var resetBackground = (undefined === buffers.background ? false : buffers.background);
	            var resetLed = (undefined === buffers.led ? false : buffers.led);
	            var resetBargraphLed = (undefined === buffers.bargraphled ? false : buffers.bargraphled);
	            var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);
	
	            if (resetFrame) {
	                frameBuffer.width = width;
	                frameBuffer.height = height;
	                frameContext = frameBuffer.getContext('2d');
	            }
	
	            if (resetBackground) {
	                backgroundBuffer.width = width;
	                backgroundBuffer.height = height;
	                backgroundContext = backgroundBuffer.getContext('2d');
	            }
	
	            if (resetBargraphLed) {
	                if (vertical) {
	                    activeLedBuffer.width = width * 0.121428;
	                    activeLedBuffer.height = height * 0.012135;
	                } else {
	                    activeLedBuffer.width = width * 0.012135;
	                    activeLedBuffer.height = height * 0.121428;
	                }
	                activeLedContext = activeLedBuffer.getContext('2d');
	
	                // Buffer for active bargraph led
	                if (vertical) {
	                    inActiveLedBuffer.width = width * 0.121428;
	                    inActiveLedBuffer.height = height * 0.012135;
	                } else {
	                    inActiveLedBuffer.width = width * 0.012135;
	                    inActiveLedBuffer.height = height * 0.121428;
	                }
	                inActiveLedContext = inActiveLedBuffer.getContext('2d');
	            }
	
	            if (resetLed) {
	                ledBufferOn.width = Math.ceil(width * 0.093457);
	                ledBufferOn.height = Math.ceil(height * 0.093457);
	                ledContextOn = ledBufferOn.getContext('2d');
	
	                ledBufferOff.width = Math.ceil(width * 0.093457);
	                ledBufferOff.height = Math.ceil(height * 0.093457);
	                ledContextOff = ledBufferOff.getContext('2d');
	
	                // Buffer for current led painting code
	                ledBuffer = ledBufferOff;
	            }
	
	            if (resetForeground) {
	                foregroundBuffer.width = width;
	                foregroundBuffer.height = height;
	                foregroundContext = foregroundBuffer.getContext('2d');
	            }
	        };
	
	        var blink = function (blinking) {
	            if (blinking) {
	                ledTimerId = setInterval(toggleAndRepaintLed, 1000);
	            } else {
	                clearInterval(ledTimerId);
	                ledBuffer = ledBufferOff;
	            }
	        };
	
	        var toggleAndRepaintLed = function () {
	            if (ledVisible) {
	                if (ledBuffer === ledBufferOn) {
	                    ledBuffer = ledBufferOff;
	                } else {
	                    ledBuffer = ledBufferOn;
	                }
	                if (!repainting) {
	                    repainting = true;
	                    requestAnimFrame(self.repaint);
	                }
	            }
	        };
	
	        var drawValue = function (ctx, imageWidth, imageHeight) {
	            var top; // position of max value
	            var bottom; // position of min value
	            var labelColor = backgroundColor.labelColor;
	            var fullSize;
	            var valueSize;
	            var valueTop;
	            var valueBackgroundStartX;
	            var valueBackgroundStartY;
	            var valueBackgroundStopX;
	            var valueBackgroundStopY;
	            var valueBorderStartX;
	            var valueBorderStartY;
	            var valueBorderStopX;
	            var valueBorderStopY;
	            var currentValue;
	            var gradRange;
	            var fraction;
	
	            // Orientation dependend definitions
	            if (vertical) {
	                // Vertical orientation
	                top =  imageHeight * 0.128640; // position of max value
	                bottom = imageHeight * 0.856796; // position of min value
	                fullSize = bottom - top;
	                valueSize = fullSize * (value - minValue) / (maxValue - minValue);
	                valueTop = top + fullSize - valueSize;
	                valueBackgroundStartX = 0;
	                valueBackgroundStartY = top;
	                valueBackgroundStopX = 0;
	                valueBackgroundStopY = top + fullSize * 1.014;
	            } else {
	                // Horizontal orientation
	                top = imageWidth * 0.856796; // position of max value
	                bottom = imageWidth * 0.128640;
	                fullSize = top - bottom;
	                valueSize = fullSize * (value - minValue) / (maxValue - minValue);
	                valueTop = bottom;
	                valueBackgroundStartX = imageWidth * 0.13;
	                valueBackgroundStartY = imageHeight * 0.435714;
	                valueBackgroundStopX = valueBackgroundStartX + fullSize * 1.035;
	                valueBackgroundStopY = valueBackgroundStartY;
	            }
	
	            var darker = (backgroundColor === steelseries.BackgroundColor.CARBON ||
	                          backgroundColor === steelseries.BackgroundColor.PUNCHED_SHEET ||
	                          backgroundColor === steelseries.BackgroundColor.STAINLESS ||
	                          backgroundColor === steelseries.BackgroundColor.BRUSHED_STAINLESS ||
	                          backgroundColor === steelseries.BackgroundColor.TURNED) ? 0.3 : 0;
	
	            var valueBackgroundTrackGradient = ctx.createLinearGradient(valueBackgroundStartX, valueBackgroundStartY, valueBackgroundStopX, valueBackgroundStopY);
	            labelColor.setAlpha(0.047058 + darker);
	            valueBackgroundTrackGradient.addColorStop(0, labelColor.getRgbaColor());
	            labelColor.setAlpha(0.145098 + darker);
	            valueBackgroundTrackGradient.addColorStop(0.48, labelColor.getRgbaColor());
	            labelColor.setAlpha(0.149019 + darker);
	            valueBackgroundTrackGradient.addColorStop(0.49, labelColor.getRgbaColor());
	            labelColor.setAlpha(0.047058 + darker);
	            valueBackgroundTrackGradient.addColorStop(1, labelColor.getRgbaColor());
	            ctx.fillStyle = valueBackgroundTrackGradient;
	
	            if (vertical) {
	                ctx.fillRect(imageWidth * 0.435714, top, imageWidth * 0.15, fullSize * 1.014);
	            } else {
	                ctx.fillRect(valueBackgroundStartX, valueBackgroundStartY, fullSize * 1.035, imageHeight * 0.152857);
	            }
	
	            if (vertical) {
	                // Vertical orientation
	                valueBorderStartX = 0;
	                valueBorderStartY = top;
	                valueBorderStopX = 0;
	                valueBorderStopY = top + fullSize * 1.014;
	            } else {
	                // Horizontal orientation                ;
	                valueBorderStartX = valueBackgroundStartX;
	                valueBorderStartY = 0;
	                valueBorderStopX = valueBackgroundStopX;
	                valueBorderStopY = 0;
	            }
	
	            var valueBorderGradient = ctx.createLinearGradient(valueBorderStartX, valueBorderStartY, valueBorderStopX, valueBorderStopY);
	            labelColor.setAlpha(0.298039 + darker);
	            valueBorderGradient.addColorStop(0, labelColor.getRgbaColor());
	            labelColor.setAlpha(0.686274 + darker);
	            valueBorderGradient.addColorStop(0.48, labelColor.getRgbaColor());
	            labelColor.setAlpha(0.698039 + darker);
	            valueBorderGradient.addColorStop(0.49, labelColor.getRgbaColor());
	            labelColor.setAlpha(0.4 + darker);
	            valueBorderGradient.addColorStop(1, labelColor.getRgbaColor());
	            ctx.fillStyle = valueBorderGradient;
	            if (vertical) {
	                ctx.fillRect(imageWidth * 0.435714, top, imageWidth * 0.007142, fullSize * 1.014);
	                ctx.fillRect(imageWidth * 0.571428, top, imageWidth * 0.007142, fullSize * 1.014);
	            } else {
	                ctx.fillRect(imageWidth * 0.13, imageHeight * 0.435714, fullSize * 1.035, imageHeight * 0.007142);
	                ctx.fillRect(imageWidth * 0.13, imageHeight * 0.571428, fullSize * 1.035, imageHeight * 0.007142);
	            }
	
	            // Prepare led specific variables
	            var ledX;
	            var ledY;
	            var ledW;
	            var ledH;
	            var ledCenterX;
	            var ledCenterY;
	            var activeLeds;
	            var inactiveLeds;
	            if (vertical) {
	                // VERTICAL
	                ledX = imageWidth * 0.45;
	                ledY = imageHeight * 0.851941;
	                ledW = imageWidth * 0.121428;
	                ledH = imageHeight * 0.012135;
	                ledCenterX = (ledX + ledW) / 2;
	                ledCenterY = (ledY + ledH) / 2;
	            } else {
	                // HORIZONTAL
	                ledX = imageWidth * 0.142857;
	                ledY = imageHeight * 0.45;
	                ledW = imageWidth * 0.012135;
	                ledH = imageHeight * 0.121428;
	                ledCenterX = (ledX + ledW) / 2;
	                ledCenterY = (ledY + ledH) / 2;
	            }
	
	            var translateX, translateY;
	            var activeLedColor;
	            var lastActiveLedColor = valueColor;
	            var i;
	            // Draw the value
	            if (vertical) {
	                // Draw the inactive leds
	                inactiveLeds = fullSize;
	                for (translateY = 0 ; translateY <= inactiveLeds ; translateY += ledH + 1) {
	                    ctx.translate(0, -translateY);
	                    ctx.drawImage(inActiveLedBuffer, ledX, ledY);
	                    ctx.translate(0, translateY);
	                }
	                // Draw the active leds in dependence on the current value
	                activeLeds = ((value - minValue) / (maxValue - minValue)) * fullSize;
	                for (translateY = 0 ; translateY <= activeLeds ; translateY += ledH + 1) {
	                    //check for LED color
	                    activeLedColor = valueColor;
	                    // Use a gradient for value colors?
	                    if (isGradientVisible) {
	                        // Convert pixel back to value
	                        currentValue = minValue + (translateY / fullSize) * (maxValue - minValue);
	                        gradRange = valueGradient.getEnd() - valueGradient.getStart();
	                        fraction = currentValue / gradRange;
	                        fraction = Math.max(Math.min(fraction, 1), 0);
	                        activeLedColor = customColorDef(valueGradient.getColorAt(fraction).getRgbaColor());
	                    } else if (isSectionsVisible) {
	                        for (i = 0; i < sectionPixels.length; i++) {
	                            if (translateY >= sectionPixels[i].start && translateY < sectionPixels[i].stop) {
	                                activeLedColor = sectionPixels[i].color;
	                                break;
	                            }
	                        }
	                    }
	                    // Has LED color changed? If so redraw the buffer
	                    if (lastActiveLedColor.medium.getHexColor() !== activeLedColor.medium.getHexColor()) {
	                        drawActiveLed(activeLedContext, activeLedColor);
	                        lastActiveLedColor = activeLedColor;
	                    }
	                    // Draw LED
	                    ctx.translate(0, -translateY);
	                    ctx.drawImage(activeLedBuffer, ledX, ledY);
	                    ctx.translate(0, translateY);
	                }
	            } else {
	                // Draw the inactive leds
	                inactiveLeds = fullSize;
	                for (translateX = -(ledW / 2) ; translateX <= inactiveLeds ; translateX += ledW + 1) {
	                    ctx.translate(translateX, 0);
	                    ctx.drawImage(inActiveLedBuffer, ledX, ledY);
	                    ctx.translate(-translateX, 0);
	                }
	                // Draw the active leds in dependence on the current value
	                activeLeds = ((value - minValue) / (maxValue - minValue)) * fullSize;
	                for (translateX = -(ledW / 2) ; translateX <= activeLeds ; translateX += ledW + 1) {
	                    //check for LED color
	                    activeLedColor = valueColor;
	                    if (isGradientVisible) {
	                        // Convert pixel back to value
	                        currentValue = minValue + (translateX / fullSize) * (maxValue - minValue);
	                        gradRange = valueGradient.getEnd() - valueGradient.getStart();
	                        fraction = currentValue / gradRange;
	                        fraction = Math.max(Math.min(fraction, 1), 0);
	                        activeLedColor = customColorDef(valueGradient.getColorAt(fraction).getRgbaColor());
	                    } else if (isSectionsVisible) {
	                        for (i = 0; i < sectionPixels.length; i++) {
	                            if (translateX >= sectionPixels[i].start && translateX < sectionPixels[i].stop) {
	                                activeLedColor = sectionPixels[i].color;
	                                break;
	                            }
	                        }
	                    }
	                    // Has LED color changed? If so redraw the buffer
	                    if (lastActiveLedColor.medium.getHexColor() !== activeLedColor.medium.getHexColor()) {
	                        drawActiveLed(activeLedContext, activeLedColor);
	                        lastActiveLedColor = activeLedColor;
	                    }
	                    ctx.translate(translateX, 0);
	                    ctx.drawImage(activeLedBuffer, ledX, ledY);
	                    ctx.translate(-translateX, 0);
	                }
	            }
	        };
	
	        var drawInActiveLed = function (ctx) {
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
	            ctx.closePath();
	            var ledCenterX = (ctx.canvas.width / 2);
	            var ledCenterY = (ctx.canvas.height / 2);
	            var ledGradient = mainCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, ctx.canvas.width / 2);
	            ledGradient.addColorStop(0, '#3c3c3c');
	            ledGradient.addColorStop(1, '#323232');
	            ctx.fillStyle = ledGradient;
	            ctx.fill();
	            ctx.restore();
	        };
	
	        var drawActiveLed = function (ctx, color) {
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
	            ctx.closePath();
	            var ledCenterX = (ctx.canvas.width / 2);
	            var ledCenterY = (ctx.canvas.height / 2);
	            var outerRadius;
	            if (vertical) {
	                outerRadius = ctx.canvas.width / 2;
	            } else {
	                outerRadius = ctx.canvas.height / 2;
	            }
	            var ledGradient = mainCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, outerRadius);
	            ledGradient.addColorStop(0, color.light.getRgbaColor());
	            ledGradient.addColorStop(1, color.dark.getRgbaColor());
	            ctx.fillStyle = ledGradient;
	            ctx.fill();
	            ctx.restore();
	        };
	
	        //************************************ Public methods **************************************
	        this.setValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
	            if (value !== targetValue) {
	                value = targetValue;
	
	                if (value > maxMeasuredValue) {
	                    maxMeasuredValue = value;
	                }
	                if (value < minMeasuredValue) {
	                    minMeasuredValue = value;
	                }
	
	                if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                    (value <= threshold && !ledBlinking && !thresholdRising)) {
	                    ledBlinking = true;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.play();
	                    }
	                } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                           (value > threshold && ledBlinking && !thresholdRising)) {
	                    ledBlinking = false;
	                    blink(ledBlinking);
	                    if (playAlarm) {
	                        audioElement.pause();
	                    }
	                }
	
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.setValueAnimated = function (newValue, callback) {
	            var targetValue,
	                gauge = this,
	                time;
	            newValue = parseFloat(newValue);
	            targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
	
	            if (value !== targetValue) {
	                if (undefined !== tween && tween.isPlaying) {
	                    tween.stop();
	                }
	
	                time = fullScaleDeflectionTime * Math.abs(targetValue - value) / (maxValue - minValue);
	                time = Math.max(time, fullScaleDeflectionTime / 5);
	                tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, time);
	                //tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, 1);
	                //tween = new Tween(new Object(), '', Tween.strongEaseInOut, value, targetValue, 1);
	                tween.onMotionChanged = function (event) {
	                    value = event.target._pos;
	
	                    if ((value >= threshold && !ledBlinking && thresholdRising) ||
	                        (value <= threshold && !ledBlinking && !thresholdRising)) {
	                        ledBlinking = true;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.play();
	                        }
	                    } else if ((value < threshold && ledBlinking && thresholdRising) ||
	                               (value > threshold && ledBlinking && !thresholdRising)) {
	                        ledBlinking = false;
	                        blink(ledBlinking);
	                        if (playAlarm) {
	                            audioElement.pause();
	                        }
	                    }
	
	                    if (value > maxMeasuredValue) {
	                        maxMeasuredValue = value;
	                    }
	                    if (value < minMeasuredValue) {
	                        minMeasuredValue = value;
	                    }
	
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tween.onMotionFinished = callback;
	                }
	
	                tween.start();
	            }
	            return this;
	        };
	
	        this.resetMinMeasuredValue = function () {
	            minMeasuredValue = value;
	            this.repaint();
	            return this;
	        };
	
	        this.resetMaxMeasuredValue = function () {
	            maxMeasuredValue = value;
	            this.repaint();
	            return this;
	        };
	
	        this.setMinMeasuredValueVisible = function (visible) {
	            minMeasuredValueVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setMaxMeasuredValueVisible = function (visible) {
	            maxMeasuredValueVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setThresholdVisible = function (visible) {
	            thresholdVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setThresholdRising = function (rising) {
	            thresholdRising = !!rising;
	            // reset existing threshold alerts
	            ledBlinking = !ledBlinking;
	            blink(ledBlinking);
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdDecimals = function (decimals) {
	            lcdDecimals = parseInt(decimals, 10);
	            this.repaint();
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers({frame: true});
	            frameDesign = newFrameDesign;
	            init({frame: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers({background: true});
	            backgroundColor = newBackgroundColor;
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setValueColor = function (newValueColor) {
	            resetBuffers({bargraphled: true});
	            valueColor = newValueColor;
	            init({bargraphled: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLedColor = function (newLedColor) {
	            resetBuffers({led: true});
	            ledColor = newLedColor;
	            init({led: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLedVisible = function (visible) {
	            ledVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdColor = function (newLcdColor) {
	            lcdColor = newLcdColor;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setSection = function (areaSec) {
	            section = areaSec;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setSectionActive = function (value) {
	            useSectionColors = value;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setGradient = function (grad) {
	            valueGradient = grad;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setGradientActive = function (value) {
	            useValueGradient = value;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setMaxMeasuredValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
	            if (maxMeasuredValue !== targetValue) {
	                maxMeasuredValue = targetValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.setMinMeasuredValue = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
	            if (minMeasuredValue !== targetValue) {
	                minMeasuredValue = targetValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.setTitleString = function (title) {
	            titleString = title;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setUnitString = function (unit) {
	            unitString = unit;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setMinValue = function (value) {
	            minValue = parseFloat(value);
	            resetBuffers({background: true,
	                          foreground: true,
	                          pointer: true});
	            init({background: true,
	                foreground: true,
	                pointer: true});
	            this.repaint();
	            return this;
	        };
	
	        this.getMinValue = function () {
	            return minValue;
	        };
	
	        this.setMaxValue = function (value) {
	            maxValue = parseFloat(value);
	            resetBuffers({background: true,
	                          foreground: true,
	                          pointer: true});
	            init({background: true,
	                  foreground: true,
	                  pointer: true});
	            this.repaint();
	            return this;
	        };
	
	        this.getMaxValue = function () {
	            return maxValue;
	        };
	
	        this.setThreshold = function (newValue) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
	            if (threshold !== targetValue) {
	                threshold = targetValue;
	                resetBuffers({background: true});
	                init({background: true});
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.setThresholdVisible = function (visible) {
	            thresholdVisible = !!visible;
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init({frame: true,
	                      background: true,
	                      led: true,
	                      pointer: true,
	                      foreground: true,
	                      bargraphled: true});
	            }
	
	            //mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            // Draw frame
	            if (frameVisible) {
	                mainCtx.drawImage(frameBuffer, 0, 0);
	            }
	
	            // Draw buffered image to visible canvas
	            if (backgroundVisible) {
	                mainCtx.drawImage(backgroundBuffer, 0, 0);
	            }
	
	            // Draw lcd display
	            if (lcdVisible) {
	                drawLcdText(mainCtx, value, vertical);
	            }
	
	            // Draw led
	            if (ledVisible) {
	                mainCtx.drawImage(ledBuffer, ledPosX, ledPosY);
	            }
	            var valuePos;
	            var minMaxX, minMaxY;
	           // Draw min measured value indicator
	            if (minMeasuredValueVisible) {
	                if (vertical) {
	                    valuePos = imageHeight * 0.856796 - (imageHeight * 0.728155) * (minMeasuredValue - minValue) / (maxValue - minValue);
	                    minMaxX = imageWidth * 0.34 - minMeasuredValueBuffer.width;
	                    minMaxY = valuePos - minMeasuredValueBuffer.height / 2;
	                } else {
	                    valuePos = ((imageWidth * 0.856796) - (imageWidth * 0.128640)) * (minMeasuredValue - minValue) / (maxValue - minValue);
	                    minMaxX = imageWidth * 0.142857 - minMeasuredValueBuffer.height / 2 + valuePos;
	                    minMaxY = imageHeight * 0.65;
	                }
	                mainCtx.drawImage(minMeasuredValueBuffer, minMaxX, minMaxY);
	            }
	
	            // Draw max measured value indicator
	            if (maxMeasuredValueVisible) {
	                if (vertical) {
	                    valuePos = imageHeight * 0.856796 - (imageHeight * 0.728155) * (maxMeasuredValue - minValue) / (maxValue - minValue);
	                    minMaxX = imageWidth * 0.34 - maxMeasuredValueBuffer.width;
	                    minMaxY = valuePos - maxMeasuredValueBuffer.height / 2;
	                } else {
	                    valuePos = ((imageWidth * 0.856796) - (imageWidth * 0.128640)) * (maxMeasuredValue - minValue) / (maxValue - minValue);
	                    minMaxX = imageWidth * 0.142857 - maxMeasuredValueBuffer.height / 2 + valuePos;
	                    minMaxY = imageHeight * 0.65;
	                }
	                mainCtx.drawImage(maxMeasuredValueBuffer, minMaxX, minMaxY);
	            }
	
	            mainCtx.save();
	            drawValue(mainCtx, imageWidth, imageHeight);
	            mainCtx.restore();
	
	            // Draw foreground
	            if (foregroundVisible) {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var displaySingle = function (canvas, parameters) {
	        parameters = parameters || {};
	        var width = (undefined === parameters.width ? 0 : parameters.width),
	            height = (undefined === parameters.height ? 0 : parameters.height),
	            lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor),
	            lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
	            unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
	            unitStringVisible = (undefined === parameters.unitStringVisible ? false : parameters.unitStringVisible),
	            headerString = (undefined === parameters.headerString ? '' : parameters.headerString),
	            headerStringVisible = (undefined === parameters.headerStringVisible ? false : parameters.headerStringVisible),
	            digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
	            valuesNumeric = (undefined === parameters.valuesNumeric ? true : parameters.valuesNumeric),
	            value = (undefined === parameters.value ? 0 : parameters.value),
	            alwaysScroll = (undefined === parameters.alwaysScroll ? false : parameters.alwaysScroll),
	            autoScroll = (undefined === parameters.autoScroll ? false : parameters.autoScroll),
	            section = (undefined === parameters.section ? null : parameters.section);
	
	        var scrolling = false;
	        var scrollX = 0;
	        var scrollTimer;
	        var repainting = false;
	
	        var self = this;
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (width === 0) {
	            width = mainCtx.canvas.width;
	        }
	        if (height === 0) {
	            height = mainCtx.canvas.height;
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = width;
	        mainCtx.canvas.height = height;
	
	        var imageWidth = width;
	        var imageHeight = height;
	        var textWidth = 0;
	
	        var fontHeight = Math.floor(imageHeight / 1.5);
	        var stdFont = fontHeight + 'px ' + stdFontName;
	        var lcdFont = fontHeight + 'px ' + lcdFontName;
	
	        var initialized = false;
	
	        // **************   Buffer creation  ********************
	        // Buffer for the lcd
	        var lcdBuffer;
	        var sectionBuffer = [];
	        var sectionForegroundColor = [];
	
	        // **************   Image creation  ********************
	        var drawLcdText = function (value, color) {
	            mainCtx.save();
	            mainCtx.textAlign = 'right';
	            //mainCtx.textBaseline = 'top';
	            mainCtx.strokeStyle = color;
	            mainCtx.fillStyle = color;
	
	            mainCtx.beginPath();
	            mainCtx.rect(2, 0, imageWidth - 4, imageHeight);
	            mainCtx.closePath();
	            mainCtx.clip();
	
	            if ((lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) &&
	                 section === null) {
	                mainCtx.shadowColor = 'gray';
	                mainCtx.shadowOffsetX = imageHeight * 0.035;
	                mainCtx.shadowOffsetY = imageHeight * 0.035;
	                mainCtx.shadowBlur = imageHeight * 0.055;
	            }
	
	            mainCtx.font = digitalFont ? lcdFont : stdFont;
	
	            if (valuesNumeric) {
	                // Numeric value
	                var unitWidth = 0;
	                textWidth = 0;
	                if (unitStringVisible) {
	                    mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
	                    unitWidth = mainCtx.measureText(unitString).width;
	                }
	                mainCtx.font = digitalFont ? lcdFont : stdFont;
	                var lcdText = value.toFixed(lcdDecimals);
	                textWidth = mainCtx.measureText(lcdText).width;
	                var vPos = 0.38;
	                if (headerStringVisible) {
	                    vPos = 0.52;
	                }
	
	                mainCtx.fillText(lcdText, imageWidth - unitWidth - 4 - scrollX, imageHeight * 0.5 + fontHeight * vPos);
	
	                if (unitStringVisible) {
	                    mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
	                    mainCtx.fillText(unitString, imageWidth - 2 - scrollX, imageHeight * 0.5 + fontHeight * vPos);
	                }
	                if (headerStringVisible) {
	                    mainCtx.textAlign = 'center';
	                    mainCtx.font = Math.floor(imageHeight / 3.5) + 'px ' + stdFontName;
	                    mainCtx.fillText(headerString, imageWidth / 2, imageHeight * 0.3);
	                }
	            } else {
	                // Text value
	                textWidth = mainCtx.measureText(value).width;
	                if (alwaysScroll || (autoScroll && textWidth > imageWidth - 4)) {
	                    if (!scrolling) {
	                        if (textWidth > imageWidth * 0.8) {
	                            scrollX = imageWidth - textWidth - imageWidth * 0.2; // leave 20% blank leading space to give time to read start of message
	                        } else {
	                            scrollX = 0;
	                        }
	                        scrolling = true;
	                        clearTimeout(scrollTimer);  // kill any pending animate
	                        scrollTimer = setTimeout(animate, 200);
	                    }
	                } else if (autoScroll && textWidth <= imageWidth - 4) {
	                    scrollX = 0;
	                    scrolling = false;
	                }
	                mainCtx.fillText(value, imageWidth - 2 - scrollX, imageHeight * 0.5 + fontHeight * 0.38);
	            }
	            mainCtx.restore();
	        };
	
	        var createLcdSectionImage = function (width, height, color, lcdColor) {
	            var lcdSectionBuffer = createBuffer(width, height);
	            var lcdCtx = lcdSectionBuffer.getContext('2d');
	
	            lcdCtx.save();
	            var xB = 0;
	            var yB = 0;
	            var wB = width;
	            var hB = height;
	            var rB = Math.min(width, height) * 0.095;
	
	            var lcdBackground = lcdCtx.createLinearGradient(0, yB, 0, yB + hB);
	
	            lcdBackground.addColorStop(0, '#4c4c4c');
	            lcdBackground.addColorStop(0.08, '#666666');
	            lcdBackground.addColorStop(0.92, '#666666');
	            lcdBackground.addColorStop(1, '#e6e6e6');
	            lcdCtx.fillStyle = lcdBackground;
	
	            roundedRectangle(lcdCtx, xB, yB, wB, hB, rB);
	
	            lcdCtx.fill();
	            lcdCtx.restore();
	
	            lcdCtx.save();
	
	            var rgb = getColorValues(color);
	            var hsb = rgbToHsb(rgb[0], rgb[1], rgb[2]);
	
	            var rgbStart = getColorValues(lcdColor.gradientStartColor);
	            var hsbStart = rgbToHsb(rgbStart[0], rgbStart[1], rgbStart[2]);
	            var rgbFraction1 = getColorValues(lcdColor.gradientFraction1Color);
	            var hsbFraction1 = rgbToHsb(rgbFraction1[0], rgbFraction1[1], rgbFraction1[2]);
	            var rgbFraction2 = getColorValues(lcdColor.gradientFraction2Color);
	            var hsbFraction2 = rgbToHsb(rgbFraction2[0], rgbFraction2[1], rgbFraction2[2]);
	            var rgbFraction3 = getColorValues(lcdColor.gradientFraction3Color);
	            var hsbFraction3 = rgbToHsb(rgbFraction3[0], rgbFraction3[1], rgbFraction3[2]);
	            var rgbStop = getColorValues(lcdColor.gradientStopColor);
	            var hsbStop = rgbToHsb(rgbStop[0], rgbStop[1], rgbStop[2]);
	
	            var startColor = hsbToRgb(hsb[0], hsb[1], hsbStart[2] - 0.31);
	            var fraction1Color = hsbToRgb(hsb[0], hsb[1], hsbFraction1[2] - 0.31);
	            var fraction2Color = hsbToRgb(hsb[0], hsb[1], hsbFraction2[2] - 0.31);
	            var fraction3Color = hsbToRgb(hsb[0], hsb[1], hsbFraction3[2] - 0.31);
	            var stopColor = hsbToRgb(hsb[0], hsb[1], hsbStop[2] - 0.31);
	
	            var xF = 1;
	            var yF = 1;
	            var wF = width - 2;
	            var hF = height - 2;
	            var rF = rB - 1;
	            var lcdForeground = lcdCtx.createLinearGradient(0, yF, 0, yF + hF);
	            lcdForeground.addColorStop(0, 'rgb(' + startColor[0] + ', ' + startColor[1] + ', ' + startColor[2] + ')');
	            lcdForeground.addColorStop(0.03, 'rgb(' + fraction1Color[0] + ',' + fraction1Color[1] + ',' + fraction1Color[2] + ')');
	            lcdForeground.addColorStop(0.49, 'rgb(' + fraction2Color[0] + ',' + fraction2Color[1] + ',' + fraction2Color[2] + ')');
	            lcdForeground.addColorStop(0.5, 'rgb(' + fraction3Color[0] + ',' + fraction3Color[1] + ',' + fraction3Color[2] + ')');
	            lcdForeground.addColorStop(1, 'rgb(' + stopColor[0] + ',' + stopColor[1] + ',' + stopColor[2] + ')');
	            lcdCtx.fillStyle = lcdForeground;
	
	            roundedRectangle(lcdCtx, xF, yF, wF, hF, rF);
	
	            lcdCtx.fill();
	            lcdCtx.restore();
	
	            return lcdSectionBuffer;
	        };
	
	        var createSectionForegroundColor = function (sectionColor) {
	            var rgbSection = getColorValues(sectionColor);
	            var hsbSection = rgbToHsb(rgbSection[0], rgbSection[1], rgbSection[2]);
	            var sectionForegroundRgb = hsbToRgb(hsbSection[0], 0.57, 0.83);
	            return 'rgb(' + sectionForegroundRgb[0] + ', ' + sectionForegroundRgb[1] + ', ' + sectionForegroundRgb[2] + ')';
	        };
	
	        var animate = function () {
	            if (scrolling) {
	                if (scrollX > imageWidth) {
	                    scrollX = -textWidth;
	                }
	                scrollX += 2;
	                scrollTimer = setTimeout(animate, 50);
	            } else {
	                scrollX = 0;
	            }
	            if (!repainting) {
	                repainting = true;
	                requestAnimFrame(self.repaint);
	            }
	        };
	
	        // **************   Initialization  ********************
	        var init = function () {
	            var sectionIndex;
	            initialized = true;
	
	            // Create lcd background if selected in background buffer (backgroundBuffer)
	            lcdBuffer = createLcdBackgroundImage(width, height, lcdColor);
	
	            if (null !== section && 0 < section.length) {
	                for (sectionIndex = 0 ; sectionIndex < section.length ; sectionIndex++) {
	                    sectionBuffer[sectionIndex] = createLcdSectionImage(width, height, section[sectionIndex].color, lcdColor);
	                    sectionForegroundColor[sectionIndex] = createSectionForegroundColor(section[sectionIndex].color);
	                }
	            }
	
	        };
	
	        // **************   Public methods  ********************
	        this.setValue = function (newValue) {
	            if (value !== newValue) {
	                value = newValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.setLcdColor = function (newLcdColor) {
	            lcdColor = newLcdColor;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setSection = function (newSection) {
	            section = newSection;
	            init({background: true, foreground: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setScrolling = function (scroll) {
	            if (scroll) {
	                if (scrolling) {
	                    return;
	                } else {
	                    scrolling = scroll;
	                    animate();
	                }
	            } else { //disable scrolling
	                scrolling = scroll;
	            }
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init();
	            }
	
	            //mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            var lcdBackgroundBuffer = lcdBuffer;
	            var lcdTextColor = lcdColor.textColor;
	            var sectionIndex;
	            // Draw sections
	            if (null !== section && 0 < section.length) {
	                for (sectionIndex = 0 ; sectionIndex < section.length ; sectionIndex++) {
	                    if (value >= section[sectionIndex].start && value <= section[sectionIndex].stop) {
	                        lcdBackgroundBuffer = sectionBuffer[sectionIndex];
	                        lcdTextColor = sectionForegroundColor[sectionIndex];
	                        break;
	                    }
	                }
	            }
	
	            // Draw lcd background
	            mainCtx.drawImage(lcdBackgroundBuffer, 0, 0);
	
	            // Draw lcd text
	            drawLcdText(value, lcdTextColor);
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var displayMulti = function (canvas, parameters) {
	        parameters = parameters || {};
	        var width = (undefined === parameters.width ? 0 : parameters.width),
	            height = (undefined === parameters.height ? 0 : parameters.height),
	            lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor),
	            lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
	            headerString = (undefined === parameters.headerString ? '' : parameters.headerString),
	            headerStringVisible = (undefined === parameters.headerStringVisible ? false : parameters.headerStringVisible),
	            detailString = (undefined === parameters.detailString ? '' : parameters.detailString),
	            detailStringVisible = (undefined === parameters.detailStringVisible ? false : parameters.detailStringVisible),
	            linkAltValue = (undefined === parameters.linkAltValue ? true : parameters.linkAltValue),
	            unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
	            unitStringVisible = (undefined === parameters.unitStringVisible ? false : parameters.unitStringVisible),
	            digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
	            valuesNumeric = (undefined === parameters.valuesNumeric ? true : parameters.valuesNumeric),
	            value = (undefined === parameters.value ? 0 : parameters.value),
	            altValue = (undefined === parameters.altValue ? 0 : parameters.altValue);
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (width === 0) {
	            width = mainCtx.canvas.width;
	        }
	        if (height === 0) {
	            height = mainCtx.canvas.height;
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = width;
	        mainCtx.canvas.height = height;
	
	        var imageWidth = width;
	        var imageHeight = height;
	
	        var stdFont = Math.floor(imageHeight / 1.875) + 'px ' + stdFontName;
	        var lcdFont = Math.floor(imageHeight / 1.875) + 'px ' + lcdFontName;
	        var stdAltFont = Math.floor(imageHeight / 3.5) + 'px ' + stdFontName;
	        var lcdAltFont = Math.floor(imageHeight / 3.5) + 'px ' + lcdFontName;
	
	        var initialized = false;
	
	        // **************   Buffer creation  ********************
	        // Buffer for the lcd
	        var lcdBuffer;
	
	        // **************   Image creation  ********************
	        var drawLcdText = function (value) {
	            mainCtx.save();
	            mainCtx.textAlign = 'right';
	            mainCtx.textBaseline = 'middle';
	            mainCtx.strokeStyle = lcdColor.textColor;
	            mainCtx.fillStyle = lcdColor.textColor;
	
	            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
	                mainCtx.shadowColor = 'gray';
	                mainCtx.shadowOffsetX = imageHeight * 0.025;
	                mainCtx.shadowOffsetY = imageHeight * 0.025;
	                mainCtx.shadowBlur = imageHeight * 0.05;
	            }
	
	            if (valuesNumeric) {
	                // Numeric value
	                if (headerStringVisible) {
	                    mainCtx.font = Math.floor(imageHeight / 3) + 'px ' + stdFontName;
	                } else {
	                    mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
	                }
	                var unitWidth = 0;
	                if (unitStringVisible) {
	                    if (headerStringVisible) {
	                        mainCtx.font = Math.floor(imageHeight / 3) + 'px ' + stdFontName;
	                        unitWidth = mainCtx.measureText(unitString).width;
	                    } else {
	                        mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
	                        unitWidth = mainCtx.measureText(unitString).width;
	                    }
	                }
	                mainCtx.font = digitalFont ? lcdFont : stdFont;
	                var valueText = value.toFixed(lcdDecimals);
	                if (headerStringVisible) {
	                    mainCtx.fillText(valueText, imageWidth - unitWidth - 4, imageHeight * 0.5);
	                } else {
	                    mainCtx.fillText(valueText, imageWidth - unitWidth - 4, imageHeight * 0.38);
	                }
	
	                if (unitStringVisible) {
	                    mainCtx.font = Math.floor(imageHeight / 3) + 'px ' + stdFontName;
	                    mainCtx.fillText(unitString, imageWidth - 2, imageHeight * 0.55);
	                }
	
	                var altValueText = altValue.toFixed(lcdDecimals);
	                if (detailStringVisible) {
	                    altValueText = detailString + altValueText;
	                }
	                if (digitalFont) {
	                    mainCtx.font = lcdAltFont;
	                } else {
	                    if (headerStringVisible) {
	                        mainCtx.font = Math.floor(imageHeight / 5) + 'px ' + stdFontName;
	                    } else {
	                        mainCtx.font = stdAltFont;
	                    }
	                }
	                mainCtx.textAlign = 'center';
	                if (headerStringVisible) {
	                    mainCtx.fillText(altValueText, imageWidth / 2, imageHeight * 0.83);
	                    mainCtx.fillText(headerString, imageWidth / 2, imageHeight * 0.16);
	                } else {
	                    mainCtx.fillText(altValueText, imageWidth / 2, imageHeight * 0.8);
	                }
	            } else {
	                if (headerStringVisible) {
	                    // Text value
	                    mainCtx.font = Math.floor(imageHeight / 3.5) + 'px ' + stdFontName;
	                    mainCtx.fillText(value, imageWidth - 2, imageHeight * 0.48);
	
	                    //mainCtx.font = stdAltFont;
	                    mainCtx.font = Math.floor(imageHeight / 5) + 'px ' + stdFontName;
	                    mainCtx.textAlign = 'center';
	                    mainCtx.fillText(altValue, imageWidth / 2, imageHeight * 0.83);
	                    mainCtx.fillText(headerString, imageWidth / 2, imageHeight * 0.17);
	                } else {
	                    // Text value
	                    mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
	                    mainCtx.fillText(value, imageWidth - 2, imageHeight * 0.38);
	
	                    mainCtx.font = stdAltFont;
	                    mainCtx.textAlign = 'center';
	                    mainCtx.fillText(altValue, imageWidth / 2, imageHeight * 0.8);
	                }
	            }
	            mainCtx.restore();
	        };
	
	        // **************   Initialization  ********************
	        var init = function () {
	            initialized = true;
	
	            // Create lcd background if selected in background buffer (backgroundBuffer)
	            lcdBuffer = createLcdBackgroundImage(width, height, lcdColor);
	        };
	
	        // **************   Public methods  ********************
	        this.setValue = function (newValue) {
	            if (value !== newValue || altValue !== newValue) {
	                if (linkAltValue) {
	                    altValue = value;
	                }
	                value = newValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.setAltValue = function (altValue) {
	            if (altValue !== altValue) {
	                altValue = altValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.setLcdColor = function (newLcdColor) {
	            lcdColor = newLcdColor;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init();
	            }
	
	            //mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            // Draw lcd background
	            mainCtx.drawImage(lcdBuffer, 0, 0);
	
	            // Draw lcd text
	            drawLcdText(value);
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var level = function (canvas, parameters) {
	        parameters = parameters || {};
	        var size = (undefined === parameters.size ? 0 : parameters.size),
	            decimalsVisible = (undefined === parameters.decimalsVisible ? false : parameters.decimalsVisible),
	            textOrientationFixed = (undefined === parameters.textOrientationFixed ? false : parameters.textOrientationFixed),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            pointerColor = (undefined === parameters.pointerColor ? steelseries.ColorDef.RED : parameters.pointerColor),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            rotateFace = (undefined === parameters.rotateFace ? false : parameters.rotateFace);
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (size === 0) {
	            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        var tween;
	        var repainting = false;
	
	        var value = 0;
	        var stepValue = 0;
	        var visibleValue = 0;
	        var angleStep = TWO_PI / 360;
	        var angle = this.value;
	        var decimals = decimalsVisible ? 1 : 0;
	
	        var imageWidth = size;
	        var imageHeight = size;
	
	        var centerX = imageWidth / 2;
	        var centerY = imageHeight / 2;
	
	        var initialized = false;
	
	        // **************   Buffer creation  ********************
	        // Buffer for all static background painting code
	        var backgroundBuffer = createBuffer(size, size);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        // Buffer for pointer image painting code
	        var pointerBuffer = createBuffer(size, size);
	        var pointerContext = pointerBuffer.getContext('2d');
	
	        // Buffer for step pointer image painting code
	        var stepPointerBuffer = createBuffer(size, size);
	        var stepPointerContext = stepPointerBuffer.getContext('2d');
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(size, size);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        // **************   Image creation  ********************
	        var drawTickmarksImage = function (ctx) {
	            var stdFont, smlFont, i;
	
	            ctx.textAlign = 'center';
	            ctx.textBaseline = 'middle';
	            ctx.save();
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.translate(centerX, centerY);
	
	            for (i = 0; 360 > i; i++) {
	                ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	                ctx.lineWidth = 0.5;
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.38, 0);
	                ctx.lineTo(imageWidth * 0.37, 0);
	                ctx.closePath();
	                ctx.stroke();
	
	                if (0 === i % 5) {
	                    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	                    ctx.lineWidth = 1;
	                    ctx.beginPath();
	                    ctx.moveTo(imageWidth * 0.38, 0);
	                    ctx.lineTo(imageWidth * 0.36, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                }
	
	                if (0 === i % 45) {
	                    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	                    ctx.lineWidth = 1;
	                    ctx.beginPath();
	                    ctx.moveTo(imageWidth * 0.38, 0);
	                    ctx.lineTo(imageWidth * 0.34, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                }
	
	                // Draw the labels
	                if (300 < imageWidth) {
	                    stdFont = '14px ' + stdFont;
	                    smlFont = '12px '  + stdFont;
	                }
	                if (300 >= imageWidth) {
	                    stdFont = '12px '  + stdFont;
	                    smlFont = '10px '  + stdFont;
	                }
	                if (200 >= imageWidth) {
	                    stdFont = '10px '  + stdFont;
	                    smlFont = '8px '  + stdFont;
	                }
	                if (100 >= imageWidth) {
	                    stdFont = '8px '  + stdFont;
	                    smlFont = '6px '  + stdFont;
	                }
	                ctx.save();
	                switch (i) {
	                case 0:
	                    ctx.translate(imageWidth * 0.31, 0);
	                    ctx.rotate((i * RAD_FACTOR) + HALF_PI);
	                    ctx.font = stdFont;
	                    ctx.fillText('0\u00B0', 0, 0, imageWidth);
	                    ctx.rotate(-(i * RAD_FACTOR) + HALF_PI);
	                    ctx.translate(-imageWidth * 0.31, 0);
	
	                    ctx.translate(imageWidth * 0.41, 0);
	                    ctx.rotate((i * RAD_FACTOR) - HALF_PI);
	                    ctx.font = smlFont;
	                    ctx.fillText('0%', 0, 0, imageWidth);
	                    break;
	                case 45:
	                    ctx.translate(imageWidth * 0.31, 0);
	                    ctx.rotate((i * RAD_FACTOR) + 0.25 * PI);
	                    ctx.font = stdFont;
	                    ctx.fillText('45\u00B0', 0, 0, imageWidth);
	                    ctx.rotate(-(i * RAD_FACTOR) + 0.25 * PI);
	                    ctx.translate(-imageWidth * 0.31, 0);
	
	                    ctx.translate(imageWidth * 0.31, imageWidth * 0.085);
	                    ctx.rotate((i * RAD_FACTOR) - 0.25 * PI);
	                    ctx.font = smlFont;
	                    ctx.fillText('100%', 0, 0, imageWidth);
	                    break;
	                case 90:
	                    ctx.translate(imageWidth * 0.31, 0);
	                    ctx.rotate((i * RAD_FACTOR));
	                    ctx.font = stdFont;
	                    ctx.fillText('90\u00B0', 0, 0, imageWidth);
	                    ctx.rotate(-(i * RAD_FACTOR));
	                    ctx.translate(-imageWidth * 0.31, 0);
	
	                    ctx.translate(imageWidth * 0.21, 0);
	                    ctx.rotate((i * RAD_FACTOR));
	                    ctx.font = smlFont;
	                    ctx.fillText('\u221E', 0, 0, imageWidth);
	                    break;
	                case 135:
	                    ctx.translate(imageWidth * 0.31, 0);
	                    ctx.rotate((i * RAD_FACTOR) - 0.25 * PI);
	                    ctx.font = stdFont;
	                    ctx.fillText('45\u00B0', 0, 0, imageWidth);
	                    ctx.rotate(-(i * RAD_FACTOR) - 0.25 * PI);
	                    ctx.translate(-imageWidth * 0.31, 0);
	
	                    ctx.translate(imageWidth * 0.31, -imageWidth * 0.085);
	                    ctx.rotate((i * RAD_FACTOR) + 0.25 * PI);
	                    ctx.font = smlFont;
	                    ctx.fillText('100%', 0, 0, imageWidth);
	                    break;
	                case 180:
	                    ctx.translate(imageWidth * 0.31, 0);
	                    ctx.rotate((i * RAD_FACTOR) - HALF_PI);
	                    ctx.font = stdFont;
	                    ctx.fillText('0\u00B0', 0, 0, imageWidth);
	                    ctx.rotate(-(i * RAD_FACTOR) - HALF_PI);
	                    ctx.translate(-imageWidth * 0.31, 0);
	
	                    ctx.translate(imageWidth * 0.41, 0);
	                    ctx.rotate((i * RAD_FACTOR) + HALF_PI);
	                    ctx.font = smlFont;
	                    ctx.fillText('0%', 0, 0, imageWidth);
	                    ctx.translate(-imageWidth * 0.41, 0);
	                    break;
	                case 225:
	                    ctx.translate(imageWidth * 0.31, 0);
	                    ctx.rotate((i * RAD_FACTOR) - 0.75 * PI);
	                    ctx.font = stdFont;
	                    ctx.fillText('45\u00B0', 0, 0, imageWidth);
	                    ctx.rotate(-(i * RAD_FACTOR) - 0.75 * PI);
	                    ctx.translate(-imageWidth * 0.31, 0);
	
	                    ctx.translate(imageWidth * 0.31, imageWidth * 0.085);
	                    ctx.rotate((i * RAD_FACTOR) + 0.75 * PI);
	                    ctx.font = smlFont;
	                    ctx.fillText('100%', 0, 0, imageWidth);
	                    break;
	                case 270:
	                    ctx.translate(imageWidth * 0.31, 0);
	                    ctx.rotate((i * RAD_FACTOR) - PI);
	                    ctx.font = stdFont;
	                    ctx.fillText('90\u00B0', 0, 0, imageWidth);
	                    ctx.rotate(-(i * RAD_FACTOR) - PI);
	                    ctx.translate(-imageWidth * 0.31, 0);
	
	                    ctx.translate(imageWidth * 0.21, 0);
	                    ctx.rotate((i * RAD_FACTOR) - PI);
	                    ctx.font = smlFont;
	                    ctx.fillText('\u221E', 0, 0, imageWidth);
	                    break;
	                case 315:
	                    ctx.translate(imageWidth * 0.31, 0);
	                    ctx.rotate((i * RAD_FACTOR) - 1.25 * PI);
	                    ctx.font = stdFont;
	                    ctx.fillText('45\u00B0', 0, 0, imageWidth);
	                    ctx.rotate(-(i * RAD_FACTOR) - 1.25 * PI);
	                    ctx.translate(-imageWidth * 0.31, 0);
	
	                    ctx.translate(imageWidth * 0.31, -imageWidth * 0.085);
	                    ctx.rotate((i * RAD_FACTOR) + 1.25 * PI);
	                    ctx.font = smlFont;
	                    ctx.fillText('100%', 0, 0, imageWidth);
	                    break;
	                }
	                ctx.restore();
	
	                ctx.rotate(angleStep);
	            }
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        var drawMarkerImage = function (ctx) {
	            ctx.save();
	
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	
	            // FRAMELEFT
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.200934, imageHeight * 0.434579);
	            ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.434579);
	            ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.560747);
	            ctx.lineTo(imageWidth * 0.200934, imageHeight * 0.560747);
	            ctx.lineWidth = 1;
	            ctx.lineCap = 'square';
	            ctx.lineJoin = 'miter';
	            ctx.stroke();
	
	            // TRIANGLELEFT
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.163551, imageHeight * 0.471962);
	            ctx.lineTo(imageWidth * 0.205607, imageHeight * 0.5);
	            ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.523364);
	            ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.471962);
	            ctx.closePath();
	            ctx.fill();
	
	            // FRAMERIGHT
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.799065, imageHeight * 0.434579);
	            ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.434579);
	            ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.560747);
	            ctx.lineTo(imageWidth * 0.799065, imageHeight * 0.560747);
	            ctx.lineWidth = 1;
	            ctx.lineCap = 'square';
	            ctx.lineJoin = 'miter';
	            ctx.stroke();
	
	            // TRIANGLERIGHT
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.836448, imageHeight * 0.471962);
	            ctx.lineTo(imageWidth * 0.794392, imageHeight * 0.5);
	            ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.523364);
	            ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.471962);
	            ctx.closePath();
	            ctx.fill();
	
	            ctx.restore();
	        };
	
	        var drawPointerImage = function (ctx) {
	            ctx.save();
	
	            // POINTER_LEVEL
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.523364, imageHeight * 0.350467);
	            ctx.lineTo(imageWidth * 0.5, imageHeight * 0.130841);
	            ctx.lineTo(imageWidth * 0.476635, imageHeight * 0.350467);
	            ctx.bezierCurveTo(imageWidth * 0.476635, imageHeight * 0.350467, imageWidth * 0.490654, imageHeight * 0.345794, imageWidth * 0.5, imageHeight * 0.345794);
	            ctx.bezierCurveTo(imageWidth * 0.509345, imageHeight * 0.345794, imageWidth * 0.523364, imageHeight * 0.350467, imageWidth * 0.523364, imageHeight * 0.350467);
	            ctx.closePath();
	            var POINTER_LEVEL_GRADIENT = ctx.createLinearGradient(0, 0.154205 * imageHeight, 0, 0.350466 * imageHeight);
	            var tmpDarkColor = pointerColor.dark;
	            var tmpLightColor = pointerColor.light;
	            tmpDarkColor.setAlpha(0.70588);
	            tmpLightColor.setAlpha(0.70588);
	            POINTER_LEVEL_GRADIENT.addColorStop(0, tmpDarkColor.getRgbaColor());
	            POINTER_LEVEL_GRADIENT.addColorStop(0.3, tmpLightColor.getRgbaColor());
	            POINTER_LEVEL_GRADIENT.addColorStop(0.59, tmpLightColor.getRgbaColor());
	            POINTER_LEVEL_GRADIENT.addColorStop(1, tmpDarkColor.getRgbaColor());
	            ctx.fillStyle = POINTER_LEVEL_GRADIENT;
	            var strokeColor_POINTER_LEVEL = pointerColor.light.getRgbaColor();
	            ctx.lineWidth = 1;
	            ctx.lineCap = 'square';
	            ctx.lineJoin = 'miter';
	            ctx.strokeStyle = strokeColor_POINTER_LEVEL;
	            ctx.fill();
	            ctx.stroke();
	
	            tmpDarkColor.setAlpha(1);
	            tmpLightColor.setAlpha(1);
	
	            ctx.restore();
	        };
	
	        var drawStepPointerImage = function (ctx) {
	            ctx.save();
	
	            var tmpDarkColor = pointerColor.dark;
	            var tmpLightColor = pointerColor.light;
	            tmpDarkColor.setAlpha(0.70588);
	            tmpLightColor.setAlpha(0.70588);
	
	            // POINTER_LEVEL_LEFT
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.285046, imageHeight * 0.514018);
	            ctx.lineTo(imageWidth * 0.210280, imageHeight * 0.5);
	            ctx.lineTo(imageWidth * 0.285046, imageHeight * 0.481308);
	            ctx.bezierCurveTo(imageWidth * 0.285046, imageHeight * 0.481308, imageWidth * 0.280373, imageHeight * 0.490654, imageWidth * 0.280373, imageHeight * 0.495327);
	            ctx.bezierCurveTo(imageWidth * 0.280373, imageHeight * 0.504672, imageWidth * 0.285046, imageHeight * 0.514018, imageWidth * 0.285046, imageHeight * 0.514018);
	            ctx.closePath();
	            var POINTER_LEVEL_LEFT_GRADIENT = ctx.createLinearGradient(0.224299 * imageWidth, 0, 0.289719 * imageWidth, 0);
	            POINTER_LEVEL_LEFT_GRADIENT.addColorStop(0, tmpDarkColor.getRgbaColor());
	            POINTER_LEVEL_LEFT_GRADIENT.addColorStop(0.3, tmpLightColor.getRgbaColor());
	            POINTER_LEVEL_LEFT_GRADIENT.addColorStop(0.59, tmpLightColor.getRgbaColor());
	            POINTER_LEVEL_LEFT_GRADIENT.addColorStop(1, tmpDarkColor.getRgbaColor());
	            ctx.fillStyle = POINTER_LEVEL_LEFT_GRADIENT;
	            var strokeColor_POINTER_LEVEL_LEFT = pointerColor.light.getRgbaColor();
	            ctx.lineWidth = 1;
	            ctx.lineCap = 'square';
	            ctx.lineJoin = 'miter';
	            ctx.strokeStyle = strokeColor_POINTER_LEVEL_LEFT;
	            ctx.fill();
	            ctx.stroke();
	
	            // POINTER_LEVEL_RIGHT
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.714953, imageHeight * 0.514018);
	            ctx.lineTo(imageWidth * 0.789719, imageHeight * 0.5);
	            ctx.lineTo(imageWidth * 0.714953, imageHeight * 0.481308);
	            ctx.bezierCurveTo(imageWidth * 0.714953, imageHeight * 0.481308, imageWidth * 0.719626, imageHeight * 0.490654, imageWidth * 0.719626, imageHeight * 0.495327);
	            ctx.bezierCurveTo(imageWidth * 0.719626, imageHeight * 0.504672, imageWidth * 0.714953, imageHeight * 0.514018, imageWidth * 0.714953, imageHeight * 0.514018);
	            ctx.closePath();
	            var POINTER_LEVEL_RIGHT_GRADIENT = ctx.createLinearGradient(0.775700 * imageWidth, 0, 0.71028 * imageWidth, 0);
	            POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(0, tmpDarkColor.getRgbaColor());
	            POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(0.3, tmpLightColor.getRgbaColor());
	            POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(0.59, tmpLightColor.getRgbaColor());
	            POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(1, tmpDarkColor.getRgbaColor());
	            ctx.fillStyle = POINTER_LEVEL_RIGHT_GRADIENT;
	            var strokeColor_POINTER_LEVEL_RIGHT = pointerColor.light.getRgbaColor();
	            ctx.lineWidth = 1;
	            ctx.lineCap = 'square';
	            ctx.lineJoin = 'miter';
	            ctx.strokeStyle = strokeColor_POINTER_LEVEL_RIGHT;
	            ctx.fill();
	            ctx.stroke();
	
	            tmpDarkColor.setAlpha(1);
	            tmpLightColor.setAlpha(1);
	
	            ctx.restore();
	        };
	
	        // **************   Initialization  ********************
	        // Draw all static painting code to background
	        var init = function () {
	            initialized = true;
	
	            if (frameVisible) {
	                drawRadialFrameImage(backgroundContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            if (backgroundVisible) {
	                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
	                drawTickmarksImage(backgroundContext);
	            }
	
	            drawMarkerImage(pointerContext);
	
	            drawPointerImage(pointerContext);
	
	            drawStepPointerImage(stepPointerContext);
	
	            if (foregroundVisible) {
	                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, false);
	            }
	        };
	
	        var resetBuffers = function () {
	            backgroundBuffer.width = size;
	            backgroundBuffer.height = size;
	            backgroundContext = backgroundBuffer.getContext('2d');
	
	            // Buffer for pointer image painting code
	            pointerBuffer.width = size;
	            pointerBuffer.height = size;
	            pointerContext = pointerBuffer.getContext('2d');
	
	            // Buffer for step pointer image painting code
	            stepPointerBuffer.width = size;
	            stepPointerBuffer.height = size;
	            stepPointerContext = stepPointerBuffer.getContext('2d');
	
	            // Buffer for static foreground painting code
	            foregroundBuffer.width = size;
	            foregroundBuffer.height = size;
	            foregroundContext = foregroundBuffer.getContext('2d');
	        };
	
	        //************************************ Public methods **************************************
	        this.setValue = function (newValue) {
	            var targetValue;
	            newValue = parseFloat(newValue);
	            targetValue = 0 > newValue ? (360 + newValue) : newValue;
	            targetValue = 359.9 < newValue ? (newValue - 360) : newValue;
	
	            if (value !== targetValue) {
	                value = targetValue;
	                stepValue = 2 * ((Math.abs(value) * 10) % 10);
	                if (10 < stepValue) {
	                    stepValue -= 20;
	                }
	
	                if (0 === value) {
	                    visibleValue = 90;
	                }
	
	                if (0 < value && 90 >= value) {
	                    visibleValue = (90 - value);
	                }
	
	                if (90 < value && 180 >= value) {
	                    visibleValue = (value - 90);
	                }
	
	                if (180 < value && 270 >= value) {
	                    visibleValue = (270 - value);
	                }
	
	                if (270 < value && 360 >= value) {
	                    visibleValue = (value - 270);
	                }
	
	                if (0 > value && value >= -90) {
	                    visibleValue = (90 - Math.abs(value));
	                }
	
	                if (value < -90 && value >= -180) {
	                    visibleValue = Math.abs(value) - 90;
	                }
	
	                if (value < -180 && value >= -270) {
	                    visibleValue = 270 - Math.abs(value);
	                }
	
	                if (value < -270 && value >= -360) {
	                    visibleValue = Math.abs(value) - 270;
	                }
	
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.setValueAnimated = function (newValue, callback) {
	            newValue = parseFloat(newValue);
	            if (360 - newValue + value < newValue - value) {
	                newValue = 360 - newValue;
	            }
	            if (value !== newValue) {
	                if (undefined !== tween && tween.isPlaying) {
	                    tween.stop();
	                }
	
	                //tween = new Tween(new Object(),'',Tween.elasticEaseOut,this.value,targetValue, 1);
	                tween = new Tween({}, '', Tween.regularEaseInOut, value, newValue, 1);
	                //tween = new Tween(new Object(), '', Tween.strongEaseInOut, this.value, targetValue, 1);
	
	                var gauge = this;
	
	                tween.onMotionChanged = function (event) {
	                    value = event.target._pos;
	                    stepValue = 2 * ((Math.abs(value) * 10) % 10);
	                    if (10 < stepValue) {
	                        stepValue -= 20;
	                    }
	
	                    if (0 === value) {
	                        visibleValue = 90;
	                    }
	
	                    if (0 < value && 90 >= value) {
	                        visibleValue = (90 - value);
	                    }
	
	                    if (90 < value && 180 >= value) {
	                        visibleValue = (value - 90);
	                    }
	
	                    if (180 < value && 270 >= value) {
	                        visibleValue = (270 - value);
	                    }
	
	                    if (270 < value && 360 >= value) {
	                        visibleValue = (value - 270);
	                    }
	
	                    if (0 > value && value >= -90) {
	                        visibleValue = (90 - Math.abs(value));
	                    }
	
	                    if (value < -90 && value >= -180) {
	                        visibleValue = Math.abs(value) - 90;
	                    }
	
	                    if (value < -180 && value >= -270) {
	                        visibleValue = 270 - Math.abs(value);
	                    }
	
	                    if (value < -270 && value >= -360) {
	                        visibleValue = Math.abs(value) - 270;
	                    }
	
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tween.onMotionFinished = callback;
	                }
	
	                tween.start();
	            }
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers();
	            frameDesign = newFrameDesign;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers();
	            backgroundColor = newBackgroundColor;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers();
	            foregroundType = newForegroundType;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerColor = function (newPointerColor) {
	            resetBuffers();
	            pointerColor = newPointerColor;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init();
	            }
	
	            mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            angle = HALF_PI + value * angleStep - HALF_PI;
	            if (rotateFace) {
	                mainCtx.translate(centerX, centerY);
	                mainCtx.rotate(-angle);
	                mainCtx.translate(-centerX, -centerY);
	            }
	            // Draw buffered image to visible canvas
	            if (frameVisible || backgroundVisible) {
	                mainCtx.drawImage(backgroundBuffer, 0, 0);
	            }
	
	            mainCtx.save();
	            // Define rotation center
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(angle);
	
	            // Draw pointer
	            mainCtx.translate(-centerX, -centerY);
	            mainCtx.drawImage(pointerBuffer, 0, 0);
	
	            mainCtx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	            mainCtx.textAlign = 'center';
	            mainCtx.textBaseline = 'middle';
	
	            if (textOrientationFixed) {
	                mainCtx.restore();
	                if (decimalsVisible) {
	                    mainCtx.font = imageWidth * 0.1 + 'px ' + stdFontName;
	                } else {
	                    mainCtx.font = imageWidth * 0.15 + 'px ' + stdFontName;
	                }
	                mainCtx.fillText(visibleValue.toFixed(decimals) + '\u00B0', centerX, centerY, imageWidth * 0.35);
	            } else {
	                if (decimalsVisible) {
	                    mainCtx.font = imageWidth * 0.15 + 'px ' + stdFontName;
	                } else {
	                    mainCtx.font = imageWidth * 0.2 + 'px ' + stdFontName;
	                }
	                mainCtx.fillText(visibleValue.toFixed(decimals) + '\u00B0', centerX, centerY, imageWidth * 0.35);
	                mainCtx.restore();
	            }
	
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(angle + stepValue * RAD_FACTOR);
	            mainCtx.translate(-centerX, -centerY);
	            mainCtx.drawImage(stepPointerBuffer, 0, 0);
	            mainCtx.restore();
	
	            // Draw foreground
	            if (foregroundVisible) {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	
	            mainCtx.restore();
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var compass = function (canvas, parameters) {
	        parameters = parameters || {};
	        var size = (undefined === parameters.size ? 0 : parameters.size),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            pointerType = (undefined === parameters.pointerType ? steelseries.PointerType.TYPE2 : parameters.pointerType),
	            pointerColor = (undefined === parameters.pointerColor ? steelseries.ColorDef.RED : parameters.pointerColor),
	            knobType = (undefined === parameters.knobType ? steelseries.KnobType.STANDARD_KNOB : parameters.knobType),
	            knobStyle = (undefined === parameters.knobStyle ? steelseries.KnobStyle.SILVER : parameters.knobStyle),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            pointSymbols = (undefined === parameters.pointSymbols ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] : parameters.pointSymbols),
	            pointSymbolsVisible = (undefined === parameters.pointSymbolsVisible ? true : parameters.pointSymbolsVisible),
	            customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
	            degreeScale = (undefined === parameters.degreeScale ? false : parameters.degreeScale),
	            roseVisible = (undefined === parameters.roseVisible ? true : parameters.roseVisible),
	            rotateFace = (undefined === parameters.rotateFace ? false : parameters.rotateFace);
	
	        var tween;
	        var repainting = false;
	        var value = 0;
	        var angleStep = RAD_FACTOR;
	        var angle = this.value;
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (size === 0) {
	            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        var imageWidth = size;
	        var imageHeight = size;
	
	        var centerX = imageWidth / 2;
	        var centerY = imageHeight / 2;
	
	        var shadowOffset = imageWidth * 0.006;
	
	        var initialized = false;
	
	        // **************   Buffer creation  ********************
	        // Buffer for all static background painting code
	        var backgroundBuffer = createBuffer(size, size);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        // Buffer for symbol/rose painting code
	        var roseBuffer = createBuffer(size, size);
	        var roseContext = roseBuffer.getContext('2d');
	
	        // Buffer for pointer image painting code
	        var pointerBuffer = createBuffer(size, size);
	        var pointerContext = pointerBuffer.getContext('2d');
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(size, size);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        // **************   Image creation  ********************
	        var drawTickmarksImage = function (ctx) {
	            var val;
	            ctx.textAlign = 'center';
	            ctx.textBaseline = 'middle';
	
	            var stdFont, smlFont, i;
	
	            ctx.save();
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.translate(centerX, centerY);
	
	            if (!degreeScale) {
	
	                stdFont = 0.12 * imageWidth + 'px serif';
	                smlFont = 0.06 * imageWidth + 'px serif';
	
	                for (i = 0; 360 > i; i += 2.5) {
	
	                    if (0 === i % 5) {
	                        ctx.lineWidth = 1;
	                        ctx.beginPath();
	                        ctx.moveTo(imageWidth * 0.38, 0);
	                        ctx.lineTo(imageWidth * 0.36, 0);
	                        ctx.closePath();
	                        ctx.stroke();
	                    }
	
	                    // Draw the labels
	                    ctx.save();
	                    switch (i) {
	                    case 0:
	                        ctx.translate(imageWidth * 0.35, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = stdFont;
	                        ctx.fillText(pointSymbols[2], 0, 0, imageWidth);
	                        ctx.translate(-imageWidth * 0.35, 0);
	                        break;
	                    case 45:
	                        ctx.translate(imageWidth * 0.29, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = smlFont;
	                        ctx.fillText(pointSymbols[3], 0, 0, imageWidth);
	                        ctx.translate(-imageWidth * 0.29, 0);
	                        break;
	                    case 90:
	                        ctx.translate(imageWidth * 0.35, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = stdFont;
	                        ctx.fillText(pointSymbols[4], 0, 0, imageWidth);
	                        ctx.translate(-imageWidth * 0.35, 0);
	                        break;
	                    case 135:
	                        ctx.translate(imageWidth * 0.29, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = smlFont;
	                        ctx.fillText(pointSymbols[5], 0, 0, imageWidth);
	                        ctx.translate(-imageWidth * 0.29, 0);
	                        break;
	                    case 180:
	                        ctx.translate(imageWidth * 0.35, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = stdFont;
	                        ctx.fillText(pointSymbols[6], 0, 0, imageWidth);
	                        ctx.translate(-imageWidth * 0.35, 0);
	                        break;
	                    case 225:
	                        ctx.translate(imageWidth * 0.29, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = smlFont;
	                        ctx.fillText(pointSymbols[7], 0, 0, imageWidth);
	                        ctx.translate(-imageWidth * 0.29, 0);
	                        break;
	                    case 270:
	                        ctx.translate(imageWidth * 0.35, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = stdFont;
	                        ctx.fillText(pointSymbols[0], 0, 0, imageWidth);
	                        ctx.translate(-imageWidth * 0.35, 0);
	                        break;
	                    case 315:
	                        ctx.translate(imageWidth * 0.29, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = smlFont;
	                        ctx.fillText(pointSymbols[1], 0, 0, imageWidth);
	                        ctx.translate(-imageWidth * 0.29, 0);
	                        break;
	                    }
	                    ctx.restore();
	
	                    if (roseVisible && (0 === i || 22.5 === i || 45 === i || 67.5 === i || 90 === i || 112.5 === i || 135 === i || 157.5 === i || 180 === i || 202.5 === i || 225 === i || 247.5 === i || 270 === i || 292.5 === i || 315 === i || 337.5 === i || 360 === i)) {
	                        // ROSE_LINE
	                        ctx.save();
	                        ctx.beginPath();
	                        // indent the 16 half quadrant lines a bit for visual effect
	                        if (i % 45) {
	                            ctx.moveTo(imageWidth * 0.29, 0);
	                        } else {
	                            ctx.moveTo(imageWidth * 0.38, 0);
	                        }
	                        ctx.lineTo(imageWidth * 0.1, 0);
	                        ctx.closePath();
	                        ctx.restore();
	                        ctx.lineWidth = 1;
	                        ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor();
	                        ctx.stroke();
	                    }
	                    ctx.rotate(angleStep * 2.5);
	                }
	            } else {
	                stdFont = 0.08 * imageWidth + 'px serif';
	                smlFont = imageWidth * 0.033 + 'px serif';
	
	                ctx.rotate(angleStep * 10);
	
	                for (i = 10; 360 >= i; i += 10) {
	                    // Draw the labels
	                    ctx.save();
	                    if (pointSymbolsVisible) {
	                        switch (i) {
	                        case 360:
	                            ctx.translate(imageWidth * 0.35, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = stdFont;
	                            ctx.fillText(pointSymbols[2], 0, 0, imageWidth);
	                            ctx.translate(-imageWidth * 0.35, 0);
	                            break;
	                        case 90:
	                            ctx.translate(imageWidth * 0.35, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = stdFont;
	                            ctx.fillText(pointSymbols[4], 0, 0, imageWidth);
	                            ctx.translate(-imageWidth * 0.35, 0);
	                            break;
	                        case 180:
	                            ctx.translate(imageWidth * 0.35, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = stdFont;
	                            ctx.fillText(pointSymbols[6], 0, 0, imageWidth);
	                            ctx.translate(-imageWidth * 0.35, 0);
	                            break;
	                        case 270:
	                            ctx.translate(imageWidth * 0.35, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = stdFont;
	                            ctx.fillText(pointSymbols[0], 0, 0, imageWidth);
	                            ctx.translate(-imageWidth * 0.35, 0);
	                            break;
	                        default:
	                            val = (i + 90) % 360;
	                            ctx.translate(imageWidth * 0.37, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = smlFont;
	                            ctx.fillText(('0'.substring(val >= 100) + val), 0, 0, imageWidth);
	                            ctx.translate(-imageWidth * 0.37, 0);
	                        }
	                    } else {
	                        val = (i + 90) % 360;
	                        ctx.translate(imageWidth * 0.37, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = smlFont;
	                        ctx.fillText(('0'.substring(val >= 100) + val), 0, 0, imageWidth);
	                        ctx.translate(-imageWidth * 0.37, 0);
	                    }
	                    ctx.restore();
	                    ctx.rotate(angleStep * 10);
	                }
	
	            }
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        var drawPointerImage = function (ctx) {
	            ctx.save();
	
	            switch (pointerType.type) {
	            case 'type2':
	                // NORTHPOINTER
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.532710, imageHeight * 0.453271);
	                ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.453271, imageWidth * 0.5, imageHeight * 0.149532, imageWidth * 0.5, imageHeight * 0.149532);
	                ctx.bezierCurveTo(imageWidth * 0.5, imageHeight * 0.149532, imageWidth * 0.467289, imageHeight * 0.453271, imageWidth * 0.467289, imageHeight * 0.453271);
	                ctx.bezierCurveTo(imageWidth * 0.453271, imageHeight * 0.462616, imageWidth * 0.443925, imageHeight * 0.481308, imageWidth * 0.443925, imageHeight * 0.5);
	                ctx.bezierCurveTo(imageWidth * 0.443925, imageHeight * 0.5, imageWidth * 0.556074, imageHeight * 0.5, imageWidth * 0.556074, imageHeight * 0.5);
	                ctx.bezierCurveTo(imageWidth * 0.556074, imageHeight * 0.481308, imageWidth * 0.546728, imageHeight * 0.462616, imageWidth * 0.532710, imageHeight * 0.453271);
	                ctx.closePath();
	                var NORTHPOINTER2_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
	                NORTHPOINTER2_GRADIENT.addColorStop(0, pointerColor.light.getRgbaColor());
	                NORTHPOINTER2_GRADIENT.addColorStop(0.46, pointerColor.light.getRgbaColor());
	                NORTHPOINTER2_GRADIENT.addColorStop(0.47, pointerColor.medium.getRgbaColor());
	                NORTHPOINTER2_GRADIENT.addColorStop(1, pointerColor.medium.getRgbaColor());
	                ctx.fillStyle = NORTHPOINTER2_GRADIENT;
	                ctx.strokeStyle = pointerColor.dark.getRgbaColor();
	                ctx.lineWidth = 1;
	                ctx.lineCap = 'square';
	                ctx.lineJoin = 'miter';
	                ctx.fill();
	                ctx.stroke();
	
	                // SOUTHPOINTER
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.467289, imageHeight * 0.546728);
	                ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.546728, imageWidth * 0.5, imageHeight * 0.850467, imageWidth * 0.5, imageHeight * 0.850467);
	                ctx.bezierCurveTo(imageWidth * 0.5, imageHeight * 0.850467, imageWidth * 0.532710, imageHeight * 0.546728, imageWidth * 0.532710, imageHeight * 0.546728);
	                ctx.bezierCurveTo(imageWidth * 0.546728, imageHeight * 0.537383, imageWidth * 0.556074, imageHeight * 0.518691, imageWidth * 0.556074, imageHeight * 0.5);
	                ctx.bezierCurveTo(imageWidth * 0.556074, imageHeight * 0.5, imageWidth * 0.443925, imageHeight * 0.5, imageWidth * 0.443925, imageHeight * 0.5);
	                ctx.bezierCurveTo(imageWidth * 0.443925, imageHeight * 0.518691, imageWidth * 0.453271, imageHeight * 0.537383, imageWidth * 0.467289, imageHeight * 0.546728);
	                ctx.closePath();
	                var SOUTHPOINTER2_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
	                SOUTHPOINTER2_GRADIENT.addColorStop(0, '#e3e5e8');
	                SOUTHPOINTER2_GRADIENT.addColorStop(0.48, '#e3e5e8');
	                SOUTHPOINTER2_GRADIENT.addColorStop(0.48, '#abb1b8');
	                SOUTHPOINTER2_GRADIENT.addColorStop(1, '#abb1b8');
	                ctx.fillStyle = SOUTHPOINTER2_GRADIENT;
	                var strokeColor_SOUTHPOINTER2 = '#abb1b8';
	                ctx.strokeStyle = strokeColor_SOUTHPOINTER2;
	                ctx.lineWidth = 1;
	                ctx.lineCap = 'square';
	                ctx.lineJoin = 'miter';
	                ctx.fill();
	                ctx.stroke();
	                break;
	
	            case 'type3':
	                // NORTHPOINTER
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.5, imageHeight * 0.149532);
	                ctx.bezierCurveTo(imageWidth * 0.5, imageHeight * 0.149532, imageWidth * 0.443925, imageHeight * 0.490654, imageWidth * 0.443925, imageHeight * 0.5);
	                ctx.bezierCurveTo(imageWidth * 0.443925, imageHeight * 0.532710, imageWidth * 0.467289, imageHeight * 0.556074, imageWidth * 0.5, imageHeight * 0.556074);
	                ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.556074, imageWidth * 0.556074, imageHeight * 0.532710, imageWidth * 0.556074, imageHeight * 0.5);
	                ctx.bezierCurveTo(imageWidth * 0.556074, imageHeight * 0.490654, imageWidth * 0.5, imageHeight * 0.149532, imageWidth * 0.5, imageHeight * 0.149532);
	                ctx.closePath();
	                var NORTHPOINTER3_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
	                NORTHPOINTER3_GRADIENT.addColorStop(0, pointerColor.light.getRgbaColor());
	                NORTHPOINTER3_GRADIENT.addColorStop(0.46, pointerColor.light.getRgbaColor());
	                NORTHPOINTER3_GRADIENT.addColorStop(0.47, pointerColor.medium.getRgbaColor());
	                NORTHPOINTER3_GRADIENT.addColorStop(1, pointerColor.medium.getRgbaColor());
	                ctx.fillStyle = NORTHPOINTER3_GRADIENT;
	                ctx.strokeStyle = pointerColor.dark.getRgbaColor();
	                ctx.lineWidth = 1;
	                ctx.lineCap = 'square';
	                ctx.lineJoin = 'miter';
	                ctx.fill();
	                ctx.stroke();
	                break;
	
	            case 'type1:':
	            /* falls through */
	            default:
	                // NORTHPOINTER
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.5, imageHeight * 0.495327);
	                ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.495327);
	                ctx.lineTo(imageWidth * 0.5, imageHeight * 0.149532);
	                ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.495327);
	                ctx.lineTo(imageWidth * 0.5, imageHeight * 0.495327);
	                ctx.closePath();
	                var NORTHPOINTER1_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
	                NORTHPOINTER1_GRADIENT.addColorStop(0, pointerColor.light.getRgbaColor());
	                NORTHPOINTER1_GRADIENT.addColorStop(0.46, pointerColor.light.getRgbaColor());
	                NORTHPOINTER1_GRADIENT.addColorStop(0.47, pointerColor.medium.getRgbaColor());
	                NORTHPOINTER1_GRADIENT.addColorStop(1, pointerColor.medium.getRgbaColor());
	                ctx.fillStyle = NORTHPOINTER1_GRADIENT;
	                ctx.strokeStyle = pointerColor.dark.getRgbaColor();
	                ctx.lineWidth = 1;
	                ctx.lineCap = 'square';
	                ctx.lineJoin = 'miter';
	                ctx.fill();
	                ctx.stroke();
	
	                // SOUTHPOINTER
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.5, imageHeight * 0.504672);
	                ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.504672);
	                ctx.lineTo(imageWidth * 0.5, imageHeight * 0.850467);
	                ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.504672);
	                ctx.lineTo(imageWidth * 0.5, imageHeight * 0.504672);
	                ctx.closePath();
	                var SOUTHPOINTER1_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
	                SOUTHPOINTER1_GRADIENT.addColorStop(0, '#e3e5e8');
	                SOUTHPOINTER1_GRADIENT.addColorStop(0.48, '#e3e5e8');
	                SOUTHPOINTER1_GRADIENT.addColorStop(0.480099, '#abb1b8');
	                SOUTHPOINTER1_GRADIENT.addColorStop(1, '#abb1b8');
	                ctx.fillStyle = SOUTHPOINTER1_GRADIENT;
	                var strokeColor_SOUTHPOINTER = '#abb1b8';
	                ctx.strokeStyle = strokeColor_SOUTHPOINTER;
	                ctx.lineWidth = 1;
	                ctx.lineCap = 'square';
	                ctx.lineJoin = 'miter';
	                ctx.fill();
	                ctx.stroke();
	                break;
	            }
	            ctx.restore();
	        };
	
	        // **************   Initialization  ********************
	        // Draw all static painting code to background
	        var init = function () {
	            initialized = true;
	
	            if (frameVisible) {
	                drawRadialFrameImage(backgroundContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            if (backgroundVisible) {
	                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
	                drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
	
	                if (roseVisible) {
	                    drawRoseImage(roseContext, centerX, centerY, imageWidth, imageHeight, backgroundColor);
	                }
	
	                drawTickmarksImage(roseContext);
	            }
	
	            drawPointerImage(pointerContext, false);
	
	            if (foregroundVisible) {
	                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, true, knobType, knobStyle);
	            }
	        };
	
	        var resetBuffers = function () {
	            // Buffer for all static background painting code
	            backgroundBuffer.width = size;
	            backgroundBuffer.height = size;
	            backgroundContext = backgroundBuffer.getContext('2d');
	
	            // Buffer for symbols/rose painting code
	            roseBuffer.width = size;
	            roseBuffer.height = size;
	            roseContext = roseBuffer.getContext('2d');
	
	            // Buffer for pointer image painting code
	            pointerBuffer.width = size;
	            pointerBuffer.height = size;
	            pointerContext = pointerBuffer.getContext('2d');
	
	            // Buffer for static foreground painting code
	            foregroundBuffer.width = size;
	            foregroundBuffer.height = size;
	            foregroundContext = foregroundBuffer.getContext('2d');
	        };
	
	        //************************************ Public methods **************************************
	        this.setValue = function (newValue) {
	            newValue = parseFloat(newValue) % 360;
	            if (value !== newValue) {
	                value = newValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.setValueAnimated = function (newValue, callback) {
	            var targetValue = newValue % 360;
	            var gauge = this;
	            var diff;
	            if (value !== targetValue) {
	                if (undefined !==  tween && tween.isPlaying) {
	                    tween.stop();
	                }
	
	                diff = getShortestAngle(value, targetValue);
	                if (rotateFace) {
	                    tween = new Tween({}, '', Tween.regularEaseInOut, value, value + diff, 2);
	                } else {
	                    tween = new Tween({}, '', Tween.elasticEaseOut, value, value + diff, 2);
	                }
	                tween.onMotionChanged = function (event) {
	                    value = event.target._pos % 360;
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tween.onMotionFinished = callback;
	                }
	
	                tween.start();
	            }
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers();
	            frameDesign = newFrameDesign;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers();
	            backgroundColor = newBackgroundColor;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers();
	            foregroundType = newForegroundType;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerColor = function (newPointerColor) {
	            resetBuffers();
	            pointerColor = newPointerColor;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerType = function (newPointerType) {
	            resetBuffers();
	            pointerType = newPointerType;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setPointSymbols = function (newPointSymbols) {
	            resetBuffers();
	            pointSymbols = newPointSymbols;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init();
	            }
	
	            mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	            // Define rotation center
	            angle = HALF_PI + value * angleStep - HALF_PI;
	
	            if (backgroundVisible || frameVisible) {
	                mainCtx.drawImage(backgroundBuffer, 0, 0);
	            }
	
	            if (rotateFace) {
	                mainCtx.save();
	                mainCtx.translate(centerX, centerY);
	                mainCtx.rotate(-angle);
	                mainCtx.translate(-centerX, -centerY);
	                if (backgroundVisible) {
	                    mainCtx.drawImage(roseBuffer, 0, 0);
	                }
	                mainCtx.restore();
	            } else {
	                if (backgroundVisible) {
	                    mainCtx.drawImage(roseBuffer, 0, 0);
	                }
	                mainCtx.translate(centerX, centerY);
	                mainCtx.rotate(angle);
	                mainCtx.translate(-centerX, -centerY);
	            }
	            // Set the pointer shadow params
	            mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
	            mainCtx.shadowBlur = shadowOffset * 2;
	            // Draw the pointer
	            mainCtx.drawImage(pointerBuffer, 0, 0);
	            // Undo the translations & shadow settings
	            mainCtx.restore();
	
	            if (foregroundVisible) {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var windDirection = function (canvas, parameters) {
	        parameters = parameters || {};
	        var size = (undefined === parameters.size ? 0 : parameters.size),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            pointerTypeLatest = (undefined === parameters.pointerTypeLatest ? steelseries.PointerType.TYPE1 : parameters.pointerTypeLatest),
	            pointerTypeAverage = (undefined === parameters.pointerTypeAverage ? steelseries.PointerType.TYPE8 : parameters.pointerTypeAverage),
	            pointerColor = (undefined === parameters.pointerColor ? steelseries.ColorDef.RED : parameters.pointerColor),
	            pointerColorAverage = (undefined === parameters.pointerColorAverage ? steelseries.ColorDef.BLUE : parameters.pointerColorAverage),
	            knobType = (undefined === parameters.knobType ? steelseries.KnobType.STANDARD_KNOB : parameters.knobType),
	            knobStyle = (undefined === parameters.knobStyle ? steelseries.KnobStyle.SILVER : parameters.knobStyle),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            pointSymbols = (undefined === parameters.pointSymbols ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] : parameters.pointSymbols),
	            pointSymbolsVisible = (undefined === parameters.pointSymbolsVisible ? true : parameters.pointSymbolsVisible),
	            customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
	            degreeScale = (undefined === parameters.degreeScale ? true : parameters.degreeScale),
	            degreeScaleHalf = (undefined === parameters.degreeScaleHalf ? false : parameters.degreeScaleHalf),
	            roseVisible = (undefined === parameters.roseVisible ? false : parameters.roseVisible),
	            lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor),
	            lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
	            digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
	            section = (undefined === parameters.section ? null : parameters.section),
	            area = (undefined === parameters.area ? null : parameters.area),
	            lcdTitleStrings = (undefined === parameters.lcdTitleStrings ? ['Latest', 'Average'] : parameters.lcdTitleStrings),
	            titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
	            useColorLabels = (undefined === parameters.useColorLabels ? false : parameters.useColorLabels),
	            fullScaleDeflectionTime = (undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime);
	
	        var tweenLatest;
	        var tweenAverage;
	        var valueLatest = 0;
	        var valueAverage = 0;
	        var angleStep = RAD_FACTOR;
	        var angleLatest = this.valueLatest;
	        var angleAverage = this.valueAverage;
	        var rotationOffset = -HALF_PI;
	        var angleRange = TWO_PI;
	        var range = 360;
	        var repainting = false;
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (size === 0) {
	            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        var imageWidth = size;
	        var imageHeight = size;
	
	        var centerX = imageWidth / 2;
	        var centerY = imageHeight / 2;
	
	        var lcdFontHeight = Math.floor(imageWidth / 10);
	        var stdFont = lcdFontHeight + 'px ' + stdFontName;
	        var lcdFont = lcdFontHeight + 'px ' + lcdFontName;
	        var lcdWidth = imageWidth * 0.3;
	        var lcdHeight = imageHeight * 0.12;
	        var lcdPosX = (imageWidth - lcdWidth) / 2;
	        var lcdPosY1 = imageHeight * 0.32;
	        var lcdPosY2 = imageHeight * 0.565;
	
	        var initialized = false;
	
	        // **************   Buffer creation  ********************
	        // Buffer for all static background painting code
	        var backgroundBuffer = createBuffer(size, size);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        // Buffer for LCD displays
	        var lcdBuffer;
	
	        // Buffer for latest pointer images painting code
	        var pointerBufferLatest = createBuffer(size, size);
	        var pointerContextLatest = pointerBufferLatest.getContext('2d');
	
	        // Buffer for average pointer image
	        var pointerBufferAverage = createBuffer(size, size);
	        var pointerContextAverage = pointerBufferAverage.getContext('2d');
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(size, size);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        // **************   Image creation  ********************
	        var drawLcdText = function (value, bLatest) {
	            mainCtx.save();
	            mainCtx.textAlign = 'center';
	            mainCtx.strokeStyle = lcdColor.textColor;
	            mainCtx.fillStyle = lcdColor.textColor;
	
	            //convert value from -180,180 range into 0-360 range
	            while (value < -180) {
	                value += 360;
	            }
	            if (!degreeScaleHalf && value < 0) {
	                value += 360;
	            }
	
	            if (degreeScaleHalf && value > 180) {
	                value = -(360 - value);
	            }
	
	            if (value >= 0) {
	                value = '00' + Math.round(value);
	                value = value.substring(value.length, value.length - 3);
	            } else {
	                value = '00' + Math.abs(Math.round(value));
	                value = '-' + value.substring(value.length, value.length - 3);
	            }
	
	            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
	                mainCtx.shadowColor = 'gray';
	                mainCtx.shadowOffsetX = imageWidth * 0.007;
	                mainCtx.shadowOffsetY = imageWidth * 0.007;
	                mainCtx.shadowBlur = imageWidth * 0.007;
	            }
	            mainCtx.font = (digitalFont ? lcdFont : stdFont);
	            mainCtx.fillText(value + '\u00B0', imageWidth / 2 + lcdWidth * 0.05, (bLatest ? lcdPosY1 : lcdPosY2) + lcdHeight * 0.5 + lcdFontHeight * 0.38, lcdWidth * 0.9);
	
	            mainCtx.restore();
	        };
	
	        var drawAreaSectionImage = function (ctx, start, stop, color, filled) {
	
	            ctx.save();
	            ctx.strokeStyle = color;
	            ctx.fillStyle = color;
	            ctx.lineWidth = imageWidth * 0.035;
	            var startAngle = (angleRange / range * start);
	            var stopAngle = startAngle + (stop - start) / (range / angleRange);
	            ctx.translate(centerX, centerY);
	            ctx.rotate(rotationOffset);
	            ctx.beginPath();
	            if (filled) {
	                ctx.moveTo(0, 0);
	                ctx.arc(0, 0, imageWidth * 0.365 - ctx.lineWidth / 2, startAngle, stopAngle, false);
	            } else {
	                ctx.arc(0, 0, imageWidth * 0.365, startAngle, stopAngle, false);
	            }
	            if (filled) {
	                ctx.moveTo(0, 0);
	                ctx.fill();
	            } else {
	                ctx.stroke();
	            }
	
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        var drawTickmarksImage = function (ctx) {
	            var OUTER_POINT = imageWidth * 0.38,
	                MAJOR_INNER_POINT = imageWidth * 0.35,
	                //MED_INNER_POINT = imageWidth * 0.355,
	                MINOR_INNER_POINT = imageWidth * 0.36,
	                TEXT_WIDTH = imageWidth * 0.1,
	                TEXT_TRANSLATE_X = imageWidth * 0.31,
	                CARDINAL_TRANSLATE_X = imageWidth * 0.36,
	                stdFont, smlFont,
	                i, val, to;
	
	            ctx.textAlign = 'center';
	            ctx.textBaseline = 'middle';
	
	            ctx.save();
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.translate(centerX, centerY);
	
	            if (!degreeScale) {
	
	                stdFont = 0.12 * imageWidth + 'px serif';
	                smlFont = 0.06 * imageWidth + 'px serif';
	
	                //var angleStep = RAD_FACTOR;
	                ctx.lineWidth = 1;
	                ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor();
	
	                for (i = 0; 360 > i; i += 2.5) {
	
	                    if (0 === i % 5) {
	                        ctx.beginPath();
	                        ctx.moveTo(imageWidth * 0.38, 0);
	                        ctx.lineTo(imageWidth * 0.36, 0);
	                        ctx.closePath();
	                        ctx.stroke();
	                    }
	
	                    // Draw the labels
	                    ctx.save();
	                    switch (i) {
	                    case 0: //E
	                        ctx.translate(imageWidth * 0.35, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = stdFont;
	                        ctx.fillText(pointSymbols[2], 0, 0);
	                        ctx.translate(-imageWidth * 0.35, 0);
	                        break;
	                    case 45: //SE
	                        ctx.translate(imageWidth * 0.29, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = smlFont;
	                        ctx.fillText(pointSymbols[3], 0, 0);
	                        ctx.translate(-imageWidth * 0.29, 0);
	                        break;
	                    case 90: //S
	                        ctx.translate(imageWidth * 0.35, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = stdFont;
	                        ctx.fillText(pointSymbols[4], 0, 0);
	                        ctx.translate(-imageWidth * 0.35, 0);
	                        break;
	                    case 135: //SW
	                        ctx.translate(imageWidth * 0.29, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = smlFont;
	                        ctx.fillText(pointSymbols[5], 0, 0);
	                        ctx.translate(-imageWidth * 0.29, 0);
	                        break;
	                    case 180: //W
	                        ctx.translate(imageWidth * 0.35, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = stdFont;
	                        ctx.fillText(pointSymbols[6], 0, 0);
	                        ctx.translate(-imageWidth * 0.35, 0);
	                        break;
	                    case 225: //NW
	                        ctx.translate(imageWidth * 0.29, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = smlFont;
	                        ctx.fillText(pointSymbols[7], 0, 0);
	                        ctx.translate(-imageWidth * 0.29, 0);
	                        break;
	                    case 270: //N
	                        ctx.translate(imageWidth * 0.35, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = stdFont;
	                        ctx.fillText(pointSymbols[0], 0, 0);
	                        ctx.translate(-imageWidth * 0.35, 0);
	                        break;
	                    case 315: //NE
	                        ctx.translate(imageWidth * 0.29, 0);
	                        ctx.rotate(HALF_PI);
	                        ctx.font = smlFont;
	                        ctx.fillText(pointSymbols[1], 0, 0);
	                        ctx.translate(-imageWidth * 0.29, 0);
	                        break;
	                    }
	                    ctx.restore();
	
	                    if (roseVisible && (0 === i || 22.5 === i || 45 === i || 67.5 === i || 90 === i || 112.5 === i || 135 === i || 157.5 === i || 180 === i || 202.5 === i || 225 === i || 247.5 === i || 270 === i || 292.5 === i || 315 === i || 337.5 === i || 360 === i)) {
	                        // ROSE_LINE
	                        ctx.save();
	                        ctx.beginPath();
	                        // indent the 16 half quadrant lines a bit for visual effect
	                        if (i % 45) {
	                            ctx.moveTo(imageWidth * 0.29, 0);
	                        } else {
	                            ctx.moveTo(imageWidth * 0.38, 0);
	                        }
	                        ctx.lineTo(imageWidth * 0.1, 0);
	                        ctx.closePath();
	                        ctx.restore();
	                        ctx.stroke();
	                    }
	                    ctx.rotate(angleStep * 2.5);
	                }
	            } else {
	                stdFont = Math.floor(0.1 * imageWidth) + 'px serif bold';
	                smlFont = Math.floor(imageWidth * 0.04) + 'px ' + stdFontName;
	
	                ctx.rotate(angleStep * 5);
	                for (i = 5; 360 >= i; i += 5) {
	                    // Draw the labels
	                    ctx.save();
	                    if (pointSymbolsVisible) {
	
	                        switch (i) {
	                        case 360:
	                            ctx.translate(CARDINAL_TRANSLATE_X, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = stdFont;
	                            ctx.fillText(pointSymbols[2], 0, 0, TEXT_WIDTH);
	                            ctx.translate(-CARDINAL_TRANSLATE_X, 0);
	                            break;
	                        case 90:
	                            ctx.translate(CARDINAL_TRANSLATE_X, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = stdFont;
	                            ctx.fillText(pointSymbols[4], 0, 0, TEXT_WIDTH);
	                            ctx.translate(-CARDINAL_TRANSLATE_X, 0);
	                            break;
	                        case 180:
	                            ctx.translate(CARDINAL_TRANSLATE_X, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = stdFont;
	                            ctx.fillText(pointSymbols[6], 0, 0, TEXT_WIDTH);
	                            ctx.translate(-CARDINAL_TRANSLATE_X, 0);
	                            break;
	                        case 270:
	                            ctx.translate(CARDINAL_TRANSLATE_X, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = stdFont;
	                            ctx.fillText(pointSymbols[0], 0, 0, TEXT_WIDTH);
	                            ctx.translate(-CARDINAL_TRANSLATE_X, 0);
	                            break;
	
	                        case 5:
	                        case 85:
	                        case 95:
	                        case 175:
	                        case 185:
	                        case 265:
	                        case 275:
	                        case 355:
	                            //leave room for ordinal labels
	                            break;
	
	                        default:
	                            if ((i + 90) % 20) {
	                                ctx.lineWidth = ((i + 90) % 5) ? 1.5 : 1;
	                                ctx.beginPath();
	                                ctx.moveTo(OUTER_POINT, 0);
	                                to = (i + 90) % 10 ? MINOR_INNER_POINT : MAJOR_INNER_POINT;
	                                ctx.lineTo(to, 0);
	                                ctx.closePath();
	                                ctx.stroke();
	                            } else {
	                                ctx.lineWidth = 1.5;
	                                ctx.beginPath();
	                                ctx.moveTo(OUTER_POINT, 0);
	                                ctx.lineTo(MAJOR_INNER_POINT, 0);
	                                ctx.closePath();
	                                ctx.stroke();
	                                val = (i + 90) % 360;
	                                ctx.translate(TEXT_TRANSLATE_X, 0);
	                                ctx.rotate(HALF_PI);
	                                ctx.font = smlFont;
	                                ctx.fillText(('0'.substring(val >= 100) + val), 0, 0, TEXT_WIDTH);
	                                ctx.translate(-TEXT_TRANSLATE_X, 0);
	                            }
	                        }
	                    } else {
	
	                        if ((i + 90) % 20) {
	                            ctx.lineWidth = ((i + 90) % 5) ? 1.5 : 1;
	                            ctx.beginPath();
	                            ctx.moveTo(OUTER_POINT, 0);
	                            to = (i + 90) % 10 ? MINOR_INNER_POINT : MAJOR_INNER_POINT;
	                            ctx.lineTo(to, 0);
	                            ctx.closePath();
	                            ctx.stroke();
	                        } else {
	                            ctx.lineWidth = 1.5;
	                            ctx.beginPath();
	                            ctx.moveTo(OUTER_POINT, 0);
	                            ctx.lineTo(MAJOR_INNER_POINT, 0);
	                            ctx.closePath();
	                            ctx.stroke();
	                            val = (i + 90) % 360;
	                            if (degreeScaleHalf) {
	                                //invert 180-360
	                                if (val > 180) {
	                                    val = -(360 - val);
	                                }
	                            }
	                            ctx.translate(TEXT_TRANSLATE_X, 0);
	                            ctx.rotate(HALF_PI);
	                            ctx.font = smlFont;
	                            ctx.fillText(val, 0, 0, TEXT_WIDTH);
	                            ctx.translate(-TEXT_TRANSLATE_X, 0);
	                        }
	                    }
	                    ctx.restore();
	                    ctx.rotate(angleStep * 5);
	                }
	
	            }
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        var drawLcdTitles = function (ctx) {
	            if (lcdTitleStrings.length > 0) {
	                ctx.save();
	                ctx.textAlign = 'center';
	                ctx.textBaseline = 'middle';
	                ctx.fillStyle = (useColorLabels ? pointerColor.medium.getRgbaColor() : backgroundColor.labelColor.getRgbaColor());
	                ctx.font = 0.040 * imageWidth + 'px ' + stdFontName;
	                ctx.fillText(lcdTitleStrings[0], imageWidth / 2, imageHeight * 0.29, imageWidth * 0.3);
	                ctx.fillStyle = (useColorLabels ? pointerColorAverage.medium.getRgbaColor() : backgroundColor.labelColor.getRgbaColor());
	                ctx.fillText(lcdTitleStrings[1], imageWidth / 2, imageHeight * 0.71, imageWidth * 0.3);
	                if (titleString.length > 0) {
	                    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	                    ctx.font = 0.0467 * imageWidth + 'px ' + stdFontName;
	                    ctx.fillText(titleString, imageWidth / 2, imageHeight * 0.5, imageWidth * 0.3);
	                }
	            }
	        };
	
	        // **************   Initialization  ********************
	        // Draw all static painting code to background
	
	        var init = function (parameters) {
	            parameters = parameters || {};
	            var drawBackground = (undefined === parameters.background ? false : parameters.background);
	            var drawPointer = (undefined === parameters.pointer ? false : parameters.pointer);
	            var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
	
	            initialized = true;
	
	            if (drawBackground && frameVisible) {
	                drawRadialFrameImage(backgroundContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            if (drawBackground && backgroundVisible) {
	                // Create background in background buffer (backgroundBuffer)
	                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
	
	                // Create custom layer in background buffer (backgroundBuffer)
	                drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
	
	                // Create section in background buffer (backgroundBuffer)
	                if (null !== section && 0 < section.length) {
	                    var sectionIndex = section.length;
	                    do {
	                        sectionIndex--;
	                        drawAreaSectionImage(backgroundContext, section[sectionIndex].start, section[sectionIndex].stop, section[sectionIndex].color, false);
	                    }
	                    while (0 < sectionIndex);
	                }
	
	                // Create area in background buffer (backgroundBuffer)
	                if (null !== area && 0 < area.length) {
	                    var areaIndex = area.length;
	                    do {
	                        areaIndex--;
	                        drawAreaSectionImage(backgroundContext, area[areaIndex].start, area[areaIndex].stop, area[areaIndex].color, true);
	                    }
	                    while (0 < areaIndex);
	                }
	
	                drawTickmarksImage(backgroundContext);
	            }
	
	            if (drawBackground && roseVisible) {
	                drawRoseImage(backgroundContext, centerX, centerY, imageWidth, imageHeight, backgroundColor);
	            }
	
	            // Create lcd background if selected in background buffer (backgroundBuffer)
	            if (drawBackground && lcdVisible) {
	                lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor);
	                backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY1);
	                backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY2);
	                // Create title in background buffer (backgroundBuffer)
	                drawLcdTitles(backgroundContext);
	            }
	
	            if (drawPointer) {
	                drawPointerImage(pointerContextAverage, imageWidth, pointerTypeAverage, pointerColorAverage, backgroundColor.labelColor);
	                drawPointerImage(pointerContextLatest, imageWidth, pointerTypeLatest, pointerColor, backgroundColor.labelColor);
	            }
	
	            if (drawForeground && foregroundVisible) {
	                var knobVisible = (pointerTypeLatest.type === 'type15' || pointerTypeLatest.type === 'type16' ? false : true);
	                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, knobVisible, knobType, knobStyle);
	            }
	        };
	
	        var resetBuffers = function (buffers) {
	            buffers = buffers || {};
	            var resetBackground = (undefined === buffers.background ? false : buffers.background);
	            var resetPointer = (undefined === buffers.pointer ? false : buffers.pointer);
	            var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);
	
	            // Buffer for all static background painting code
	            if (resetBackground) {
	                backgroundBuffer.width = size;
	                backgroundBuffer.height = size;
	                backgroundContext = backgroundBuffer.getContext('2d');
	            }
	            // Buffers for pointer image painting code
	            if (resetPointer) {
	                pointerBufferLatest.width = size;
	                pointerBufferLatest.height = size;
	                pointerContextLatest = pointerBufferLatest.getContext('2d');
	
	                pointerBufferAverage.width = size;
	                pointerBufferAverage.height = size;
	                pointerContextAverage = pointerBufferAverage.getContext('2d');
	            }
	            // Buffer for static foreground painting code
	            if (resetForeground) {
	                foregroundBuffer.width = size;
	                foregroundBuffer.height = size;
	                foregroundContext = foregroundBuffer.getContext('2d');
	            }
	        };
	
	        //************************************ Public methods **************************************
	        this.setValueLatest = function (newValue) {
	            // Actually need to handle 0-360 rather than 0-359
	            // 1-360 are used for directions
	            // 0 is used as a special case to indicate 'calm'
	            newValue = parseFloat(newValue);
	            newValue = newValue === 360 ? 360 : newValue % 360;
	            if (valueLatest !== newValue) {
	                valueLatest = newValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValueLatest = function () {
	            return valueLatest;
	        };
	
	        this.setValueAverage = function (newValue) {
	            // Actually need to handle 0-360 rather than 0-359
	            // 1-360 are used for directions
	            // 0 is used as a special case to indicate 'calm'
	            newValue = parseFloat(newValue);
	            newValue = newValue === 360 ? 360 : newValue % 360;
	            if (valueAverage !== newValue) {
	                valueAverage = newValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValueAverage = function () {
	            return valueAverage;
	        };
	
	        this.setValueAnimatedLatest = function (newValue, callback) {
	            var targetValue,
	                gauge = this,
	                diff,
	                time;
	            // Actually need to handle 0-360 rather than 0-359
	            // 1-360 are used for directions
	            // 0 is used as a special case to indicate 'calm'
	            newValue = parseFloat(newValue);
	            targetValue = (newValue === 360 ? 360 : newValue % 360);
	
	            if (valueLatest !== targetValue) {
	                if (undefined !== tweenLatest && tweenLatest.isPlaying) {
	                    tweenLatest.stop();
	                }
	
	                diff = getShortestAngle(valueLatest, targetValue);
	
	                if (diff !== 0) { // 360 - 0 is a diff of zero
	                    time = fullScaleDeflectionTime * Math.abs(diff) / 180;
	                    time = Math.max(time, fullScaleDeflectionTime / 5);
	                    tweenLatest = new Tween({}, '', Tween.regularEaseInOut, valueLatest, valueLatest + diff, time);
	                    tweenLatest.onMotionChanged = function (event) {
	                        valueLatest = event.target._pos === 360 ? 360 : event.target._pos % 360;
	                        if (!repainting) {
	                            repainting = true;
	                            requestAnimFrame(gauge.repaint);
	                        }
	                    };
	
	                    tweenLatest.onMotionFinished = function (event) {
	                        valueLatest = event.target._pos === 360 ? 360 : event.target._pos % 360;
	                        if (!repainting) {
	                            repainting = true;
	                            requestAnimFrame(gauge.repaint);
	                        }
	                        // do we have a callback function to process?
	                        if (callback && typeof(callback) === "function") {
	                            callback();
	                        }
	                    };
	
	                    tweenLatest.start();
	                } else {
	                    // target different from current, but diff is zero (0 -> 360 for instance), so just repaint
	                    valueLatest = targetValue;
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                }
	            }
	            return this;
	        };
	
	        this.setValueAnimatedAverage = function (newValue, callback) {
	            var targetValue,
	                gauge = this,
	                diff, time;
	            // Actually need to handle 0-360 rather than 0-359
	            // 1-360 are used for directions
	            // 0 is used as a special case to indicate 'calm'
	            newValue = parseFloat(newValue);
	            targetValue = (newValue === 360 ? 360 : newValue % 360);
	            if (valueAverage !== newValue) {
	                if (undefined !== tweenAverage && tweenAverage.isPlaying) {
	                    tweenAverage.stop();
	                }
	
	                diff = getShortestAngle(valueAverage, targetValue);
	                if (diff !== 0) { // 360 - 0 is a diff of zero
	                    time = fullScaleDeflectionTime * Math.abs(diff) / 180;
	                    time = Math.max(time, fullScaleDeflectionTime / 5);
	                    tweenAverage = new Tween({}, '', Tween.regularEaseInOut, valueAverage, valueAverage + diff, time);
	                    tweenAverage.onMotionChanged = function (event) {
	                        valueAverage = event.target._pos === 360 ? 360 : event.target._pos % 360;
	                        if (!repainting) {
	                            repainting = true;
	                            requestAnimFrame(gauge.repaint);
	                        }
	                    };
	
	                    tweenAverage.onMotionFinished = function (event) {
	                        valueLatest = event.target._pos === 360 ? 360 : event.target._pos % 360;
	                        if (!repainting) {
	                            repainting = true;
	                            requestAnimFrame(gauge.repaint);
	                        }
	                        // do we have a callback function to process?
	                        if (callback && typeof(callback) === "function") {
	                            callback();
	                        }
	                    };
	                    
	                    tweenAverage.start();
	                } else {
	                    // target different from current, but diff is zero (0 -> 360 for instance), so just repaint
	                    valueAverage = targetValue;
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                }
	            }
	            return this;
	        };
	
	        this.setArea = function (areaVal) {
	            area = areaVal;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setSection = function (areaSec) {
	            section = areaSec;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            frameDesign = newFrameDesign;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            backgroundColor = newBackgroundColor;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers({foreground: true});
	            foregroundType = newForegroundType;
	            init({foreground: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerColor = function (newPointerColor) {
	            resetBuffers({pointer: true});
	            pointerColor = newPointerColor;
	            init({pointer: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerColorAverage = function (newPointerColor) {
	            resetBuffers({pointer: true});
	            pointerColorAverage = newPointerColor;
	            init({pointer: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerType = function (newPointerType) {
	            pointerTypeLatest = newPointerType;
	            resetBuffers({pointer: true,
	                          foreground: true
	                         });
	            init({pointer: true,
	                  foreground: true
	                  });
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerTypeAverage = function (newPointerType) {
	            pointerTypeAverage = newPointerType;
	            resetBuffers({pointer: true,
	                          foreground: true
	                         });
	            init({pointer: true,
	                  foreground: true
	                  });
	            this.repaint();
	            return this;
	        };
	
	        this.setPointSymbols = function (newPointSymbols) {
	            pointSymbols = newPointSymbols;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdColor = function (newLcdColor) {
	            lcdColor = newLcdColor;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdTitleStrings = function (titles) {
	            lcdTitleStrings = titles;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init({frame: true,
	                      background: true,
	                      led: true,
	                      pointer: true,
	                      foreground: true});
	            }
	
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            if (frameVisible || backgroundVisible) {
	                mainCtx.drawImage(backgroundBuffer, 0, 0);
	            }
	
	            // Draw lcd display
	            if (lcdVisible) {
	                drawLcdText(valueLatest, true);
	                drawLcdText(valueAverage, false);
	            }
	
	            // Define rotation angle
	            angleAverage = valueAverage * angleStep;
	
	            // we have to draw to a rotated temporary image area so we can translate in
	            // absolute x, y values when drawing to main context
	            var shadowOffset = imageWidth * 0.006;
	
	            // Define rotation center
	            mainCtx.save();
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(angleAverage);
	            mainCtx.translate(-centerX, -centerY);
	            // Set the pointer shadow params
	            mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
	            mainCtx.shadowBlur = shadowOffset * 2;
	            // Draw the pointer
	            mainCtx.drawImage(pointerBufferAverage, 0, 0);
	            // Define rotation angle difference for average pointer
	            angleLatest = valueLatest * angleStep  - angleAverage;
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(angleLatest);
	            mainCtx.translate(-centerX, -centerY);
	            mainCtx.drawImage(pointerBufferLatest, 0, 0);
	            mainCtx.restore();
	
	            if (foregroundVisible) {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var horizon = function (canvas, parameters) {
	        parameters = parameters || {};
	        var size = (undefined === parameters.size ? 0 : parameters.size),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            pointerColor = (undefined === parameters.pointerColor ? steelseries.ColorDef.WHITE : parameters.pointerColor);
	
	        var tweenRoll;
	        var tweenPitch;
	        var repainting = false;
	        var roll = 0;
	        var pitch = 0;
	        var pitchPixel = (PI * size) / 360;
	        var pitchOffset = 0;
	        var upsidedown = false;
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (size === 0) {
	            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        var imageWidth = size;
	        var imageHeight = size;
	
	        var centerX = imageWidth / 2;
	        var centerY = imageHeight / 2;
	
	        var initialized = false;
	
	        // **************   Buffer creation  ********************
	        // Buffer for all static background painting code
	        var backgroundBuffer = createBuffer(size, size);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        // Buffer for pointer image painting code
	        var valueBuffer = createBuffer(size, size * PI);
	        var valueContext = valueBuffer.getContext('2d');
	
	        // Buffer for indicator painting code
	        var indicatorBuffer = createBuffer(size * 0.037383, size * 0.056074);
	        var indicatorContext = indicatorBuffer.getContext('2d');
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(size, size);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        // **************   Image creation  ********************
	        var drawHorizonBackgroundImage = function (ctx) {
	            ctx.save();
	
	            var imgWidth = size;
	            var imgHeight = size * PI;
	            var y;
	
	            // HORIZON
	            ctx.beginPath();
	            ctx.rect(0, 0, imgWidth, imgHeight);
	            ctx.closePath();
	            var HORIZON_GRADIENT = ctx.createLinearGradient(0, 0, 0, imgHeight);
	            HORIZON_GRADIENT.addColorStop(0, '#7fd5f0');
	            HORIZON_GRADIENT.addColorStop(0.5, '#7fd5f0');
	            HORIZON_GRADIENT.addColorStop(0.5, '#3c4439');
	            HORIZON_GRADIENT.addColorStop(1, '#3c4439');
	            ctx.fillStyle = HORIZON_GRADIENT;
	            ctx.fill();
	
	            ctx.lineWidth = 1;
	            var stepSizeY = imgHeight / 360 * 5;
	            var stepTen = false;
	            var step = 10;
	
	            ctx.textAlign = 'center';
	            ctx.textBaseline = 'middle';
	            var fontSize = imgWidth * 0.04;
	            ctx.font = fontSize + 'px ' + stdFontName;
	            ctx.fillStyle = '#37596e';
	            for (y = imgHeight / 2 - stepSizeY; y > 0; y -= stepSizeY) {
	                if (step <= 90) {
	                    if (stepTen) {
	                        ctx.fillText(step, (imgWidth - (imgWidth * 0.2)) / 2 - 8, y, imgWidth * 0.375);
	                        ctx.fillText(step, imgWidth - (imgWidth - (imgWidth * 0.2)) / 2 + 8, y, imgWidth * 0.375);
	                        ctx.beginPath();
	                        ctx.moveTo((imgWidth - (imgWidth * 0.2)) / 2, y);
	                        ctx.lineTo(imgWidth - (imgWidth - (imgWidth * 0.2)) / 2, y);
	                        ctx.closePath();
	                        step += 10;
	                    } else {
	                        ctx.beginPath();
	                        ctx.moveTo((imgWidth - (imgWidth * 0.1)) / 2, y);
	                        ctx.lineTo(imgWidth - (imgWidth - (imgWidth * 0.1)) / 2, y);
	                        ctx.closePath();
	                    }
	                    ctx.stroke();
	                }
	                stepTen ^= true;
	            }
	            stepTen = false;
	            step = 10;
	            ctx.strokeStyle = '#FFFFFF';
	            ctx.lineWidth = 1.5;
	            ctx.beginPath();
	            ctx.moveTo(0, imgHeight / 2);
	            ctx.lineTo(imgWidth, imgHeight / 2);
	            ctx.closePath();
	            ctx.stroke();
	            ctx.fillStyle = '#FFFFFF';
	            ctx.lineWidth = 1;
	            for (y = imgHeight / 2 + stepSizeY; y <= imgHeight; y += stepSizeY) {
	                if (step <= 90) {
	                    if (stepTen) {
	                        ctx.fillText(-step, (imgWidth - (imgWidth * 0.2)) / 2 - 8, y, imgWidth * 0.375);
	                        ctx.fillText(-step, imgWidth - (imgWidth - (imgWidth * 0.2)) / 2 + 8, y, imgWidth * 0.375);
	                        ctx.beginPath();
	                        ctx.moveTo((imgWidth - (imgWidth * 0.2)) / 2, y);
	                        ctx.lineTo(imgWidth - (imgWidth - (imgWidth * 0.2)) / 2, y);
	                        ctx.closePath();
	                        step += 10;
	                    } else {
	                        ctx.beginPath();
	                        ctx.moveTo((imgWidth - (imgWidth * 0.1)) / 2, y);
	                        ctx.lineTo(imgWidth - (imgWidth - (imgWidth * 0.1)) / 2, y);
	                        ctx.closePath();
	                    }
	                    ctx.stroke();
	                }
	                stepTen ^= true;
	            }
	
	            ctx.restore();
	        };
	
	        var drawHorizonForegroundImage = function (ctx) {
	            ctx.save();
	
	            ctx.fillStyle = pointerColor.light.getRgbaColor();
	
	            // CENTERINDICATOR
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.476635, imageHeight * 0.5);
	            ctx.bezierCurveTo(imageWidth * 0.476635, imageHeight * 0.514018, imageWidth * 0.485981, imageHeight * 0.523364, imageWidth * 0.5, imageHeight * 0.523364);
	            ctx.bezierCurveTo(imageWidth * 0.514018, imageHeight * 0.523364, imageWidth * 0.523364, imageHeight * 0.514018, imageWidth * 0.523364, imageHeight * 0.5);
	            ctx.bezierCurveTo(imageWidth * 0.523364, imageHeight * 0.485981, imageWidth * 0.514018, imageHeight * 0.476635, imageWidth * 0.5, imageHeight * 0.476635);
	            ctx.bezierCurveTo(imageWidth * 0.485981, imageHeight * 0.476635, imageWidth * 0.476635, imageHeight * 0.485981, imageWidth * 0.476635, imageHeight * 0.5);
	            ctx.closePath();
	            ctx.moveTo(imageWidth * 0.415887, imageHeight * 0.504672);
	            ctx.lineTo(imageWidth * 0.415887, imageHeight * 0.495327);
	            ctx.bezierCurveTo(imageWidth * 0.415887, imageHeight * 0.495327, imageWidth * 0.467289, imageHeight * 0.495327, imageWidth * 0.467289, imageHeight * 0.495327);
	            ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.481308, imageWidth * 0.481308, imageHeight * 0.471962, imageWidth * 0.495327, imageHeight * 0.467289);
	            ctx.bezierCurveTo(imageWidth * 0.495327, imageHeight * 0.467289, imageWidth * 0.495327, imageHeight * 0.415887, imageWidth * 0.495327, imageHeight * 0.415887);
	            ctx.lineTo(imageWidth * 0.504672, imageHeight * 0.415887);
	            ctx.bezierCurveTo(imageWidth * 0.504672, imageHeight * 0.415887, imageWidth * 0.504672, imageHeight * 0.467289, imageWidth * 0.504672, imageHeight * 0.467289);
	            ctx.bezierCurveTo(imageWidth * 0.518691, imageHeight * 0.471962, imageWidth * 0.528037, imageHeight * 0.481308, imageWidth * 0.532710, imageHeight * 0.495327);
	            ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.495327, imageWidth * 0.584112, imageHeight * 0.495327, imageWidth * 0.584112, imageHeight * 0.495327);
	            ctx.lineTo(imageWidth * 0.584112, imageHeight * 0.504672);
	            ctx.bezierCurveTo(imageWidth * 0.584112, imageHeight * 0.504672, imageWidth * 0.532710, imageHeight * 0.504672, imageWidth * 0.532710, imageHeight * 0.504672);
	            ctx.bezierCurveTo(imageWidth * 0.528037, imageHeight * 0.518691, imageWidth * 0.518691, imageHeight * 0.532710, imageWidth * 0.5, imageHeight * 0.532710);
	            ctx.bezierCurveTo(imageWidth * 0.481308, imageHeight * 0.532710, imageWidth * 0.471962, imageHeight * 0.518691, imageWidth * 0.467289, imageHeight * 0.504672);
	            ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.504672, imageWidth * 0.415887, imageHeight * 0.504672, imageWidth * 0.415887, imageHeight * 0.504672);
	            ctx.closePath();
	            ctx.fill();
	
	            // Tickmarks
	            var step = 5;
	            var stepRad = 5 * RAD_FACTOR;
	            ctx.translate(centerX, centerY);
	            ctx.rotate(-HALF_PI);
	            ctx.translate(-centerX, -centerY);
	            var angle;
	            for (angle = -90; angle <= 90; angle += step) {
	                if (angle % 45 === 0 || angle === 0) {
	                    ctx.strokeStyle = pointerColor.medium.getRgbaColor();
	                    ctx.lineWidth = 2;
	                    ctx.beginPath();
	                    ctx.moveTo(imageWidth * 0.5, imageHeight * 0.088785);
	                    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.113);
	                    ctx.closePath();
	                    ctx.stroke();
	                } else if (angle % 15 === 0) {
	                    ctx.strokeStyle = '#FFFFFF';
	                    ctx.lineWidth = 1;
	                    ctx.beginPath();
	                    ctx.moveTo(imageWidth * 0.5, imageHeight * 0.088785);
	                    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.103785);
	                    ctx.closePath();
	                    ctx.stroke();
	                } else {
	                    ctx.strokeStyle = '#FFFFFF';
	                    ctx.lineWidth = 0.5;
	                    ctx.beginPath();
	                    ctx.moveTo(imageWidth * 0.5, imageHeight * 0.088785);
	                    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.093785);
	                    ctx.closePath();
	                    ctx.stroke();
	                }
	                ctx.translate(centerX, centerY);
	                ctx.rotate(stepRad, centerX, centerY);
	                ctx.translate(-centerX, -centerY);
	            }
	
	            ctx.restore();
	        };
	
	        var drawIndicatorImage = function (ctx) {
	            ctx.save();
	
	            var imgWidth = imageWidth * 0.037383;
	            var imgHeight = imageHeight * 0.056074;
	
	            ctx.beginPath();
	            ctx.moveTo(imgWidth * 0.5, 0);
	            ctx.lineTo(0, imgHeight);
	            ctx.lineTo(imgWidth, imgHeight);
	            ctx.closePath();
	
	            ctx.fillStyle = pointerColor.light.getRgbaColor();
	            ctx.fill();
	            ctx.strokeStyle = pointerColor.medium.getRgbaColor();
	            ctx.stroke();
	
	            ctx.restore();
	        };
	
	        // **************   Initialization  ********************
	        // Draw all static painting code to background
	        var init = function () {
	            initialized = true;
	
	            if (frameVisible) {
	                drawRadialFrameImage(backgroundContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            drawHorizonBackgroundImage(valueContext);
	
	            drawIndicatorImage(indicatorContext);
	
	            drawHorizonForegroundImage(foregroundContext);
	
	            if (foregroundVisible) {
	                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, true, knobType, knobStyle, gaugeType);
	            }
	        };
	
	        var resetBuffers = function () {
	            // Buffer for all static background painting code
	            backgroundBuffer.width = size;
	            backgroundBuffer.height = size;
	            backgroundContext = backgroundBuffer.getContext('2d');
	
	            // Buffer for pointer image painting code
	            valueBuffer.width = size;
	            valueBuffer.height = size * PI;
	            valueContext = valueBuffer.getContext('2d');
	
	            // Buffer for the indicator
	            indicatorBuffer.width = size * 0.037383;
	            indicatorBuffer.height = size * 0.056074;
	            indicatorContext = indicatorBuffer.getContext('2d');
	
	            // Buffer for static foreground painting code
	            foregroundBuffer.width = size;
	            foregroundBuffer.height = size;
	            foregroundContext = foregroundBuffer.getContext('2d');
	        };
	
	        //************************************ Public methods **************************************
	        this.setRoll = function (newRoll) {
	            newRoll = parseFloat(newRoll) % 360;
	            if (roll !== newRoll) {
	                roll = newRoll;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getRoll = function () {
	            return roll;
	        };
	
	        this.setRollAnimated = function (newRoll, callback) {
	            var gauge = this;
	            newRoll = parseFloat(newRoll) % 360;
	            if (roll !== newRoll) {
	
	                if (undefined !== tweenRoll && tweenRoll.isPlaying) {
	                    tweenRoll.stop();
	                }
	
	                tweenRoll = new Tween({}, '', Tween.regularEaseInOut, roll, newRoll, 1);
	
	                tweenRoll.onMotionChanged = function (event) {
	                    roll = event.target._pos;
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tweenRoll.onMotionFinished = callback;
	                }
	
	                tweenRoll.start();
	            }
	            return this;
	        };
	
	        this.setPitch = function (newPitch) {
	            // constrain to range -180..180
	            // normal range -90..90 and -180..-90/90..180 indicate inverted
	            newPitch = ((parseFloat(newPitch) + 180 - pitchOffset) % 360) - 180;
	            //pitch = -(newPitch + pitchOffset) % 180;
	            if (pitch !== newPitch) {
	                pitch = newPitch;
	                if (pitch > 90) {
	                    pitch = 90 - (pitch - 90);
	                    if (!upsidedown) {
	                        this.setRoll(roll - 180);
	                    }
	                    upsidedown = true;
	                } else if (pitch < -90) {
	                    pitch = -90 + (-90 - pitch);
	                    if (!upsidedown) {
	                        this.setRoll(roll + 180);
	                    }
	                    upsidedown = true;
	                } else {
	                    upsidedown = false;
	                }
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getPitch = function () {
	            return pitch;
	        };
	
	        this.setPitchAnimated = function (newPitch, callback) {
	            var gauge = this;
	            newPitch = parseFloat(newPitch);
	            // perform all range checking in setPitch()
	            if (pitch !== newPitch) {
	                if (undefined !== tweenPitch && tweenPitch.isPlaying) {
	                    tweenPitch.stop();
	                }
	                tweenPitch = new Tween({}, '', Tween.regularEaseInOut, pitch, newPitch, 1);
	                tweenPitch.onMotionChanged = function (event) {
	                    pitch = event.target._pos;
	                    if (pitch > 90) {
	                        pitch = 90 - (pitch - 90);
	                        if (!upsidedown) {
	                            this.setRoll(roll - 180);
	                        }
	                        upsidedown = true;
	                    } else if (pitch < -90) {
	                        pitch = -90 + (-90 - pitch);
	                        if (!upsidedown) {
	                            this.setRoll(roll + 180);
	                        }
	                        upsidedown = true;
	                    } else {
	                        upsidedown = false;
	                    }
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                    gauge.setPitch(event.target._pos);
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tweenPitch.onMotionFinished = callback;
	                }
	
	                tweenPitch.start();
	            }
	            return this;
	        };
	
	        this.setPitchOffset = function (newPitchOffset) {
	            pitchOffset = parseFloat(newPitchOffset);
	            this.repaint();
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers();
	            frameDesign = newFrameDesign;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers();
	            foregroundType = newForegroundType;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init();
	            }
	
	            mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            mainCtx.drawImage(backgroundBuffer, 0, 0);
	
	            mainCtx.save();
	
	            // Set the clipping area
	            mainCtx.beginPath();
	            mainCtx.arc(centerX, centerY, imageWidth * 0.831775 / 2, 0, TWO_PI, true);
	            mainCtx.closePath();
	            mainCtx.clip();
	
	            // Rotate around roll
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(-(roll * RAD_FACTOR));
	            mainCtx.translate(-centerX, 0);
	            // Translate about dive
	            mainCtx.translate(0, (pitch * pitchPixel));
	
	            // Draw horizon
	            mainCtx.drawImage(valueBuffer, 0, -valueBuffer.height / 2);
	
	            // Draw the scale and angle indicator
	            mainCtx.translate(0, -(pitch * pitchPixel) - centerY);
	            mainCtx.drawImage(indicatorBuffer, (imageWidth * 0.5 - indicatorBuffer.width / 2), (imageWidth * 0.107476));
	            mainCtx.restore();
	
	            mainCtx.drawImage(foregroundBuffer, 0, 0);
	
	            mainCtx.restore();
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var led = function (canvas, parameters) {
	        parameters = parameters || {};
	        var size = (undefined === parameters.size ? 0 : parameters.size),
	            ledColor = (undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor);
	
	        var ledBlinking = false;
	        var ledTimerId = 0;
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (size === 0) {
	            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        var initialized = false;
	
	        // Buffer for led on painting code
	        var ledBufferOn = doc.createElement('canvas');
	        ledBufferOn.width = size;
	        ledBufferOn.height = size;
	        var ledContextOn = ledBufferOn.getContext('2d');
	
	        // Buffer for led off painting code
	        var ledBufferOff = doc.createElement('canvas');
	        ledBufferOff.width = size;
	        ledBufferOff.height = size;
	        var ledContextOff = ledBufferOff.getContext('2d');
	
	        // Buffer for current led painting code
	        var ledBuffer = ledBufferOff;
	
	        var init = function () {
	            initialized = true;
	
	            // Draw LED ON in ledBuffer_ON
	            ledContextOn.clearRect(0, 0, ledContextOn.canvas.width, ledContextOn.canvas.height);
	            ledContextOn.drawImage(createLedImage(size, 1, ledColor), 0, 0);
	
	            // Draw LED ON in ledBuffer_OFF
	            ledContextOff.clearRect(0, 0, ledContextOff.canvas.width, ledContextOff.canvas.height);
	            ledContextOff.drawImage(createLedImage(size, 0, ledColor), 0, 0);
	        };
	
	        this.toggleLed = function () {
	            if (ledBuffer === ledBufferOn) {
	                ledBuffer = ledBufferOff;
	            } else {
	                ledBuffer = ledBufferOn;
	            }
	            repaint();
	            return this;
	        };
	
	        this.setLedColor = function (newColor) {
	            ledColor = newColor;
	            initialized = false;
	            repaint();
	            return this;
	        };
	
	        this.setLedOnOff = function (on) {
	            if (!!on) {
	                ledBuffer = ledBufferOn;
	            } else {
	                ledBuffer = ledBufferOff;
	            }
	            repaint();
	            return this;
	        };
	
	        this.blink = function (blink) {
	            if (!!blink) {
	                if (!ledBlinking) {
	                    ledTimerId = setInterval(this.toggleLed, 1000);
	                    ledBlinking = true;
	                }
	            } else {
	                if (ledBlinking) {
	                    clearInterval(ledTimerId);
	                    ledBlinking = false;
	                    ledBuffer = ledBufferOff;
	                }
	            }
	            return this;
	        };
	
	        var repaint = function () {
	            if (!initialized) {
	                init();
	            }
	
	            mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            mainCtx.drawImage(ledBuffer, 0, 0);
	
	            mainCtx.restore();
	        };
	
	        repaint();
	
	        return this;
	    };
	
	    var clock = function (canvas, parameters) {
	        parameters = parameters || {};
	        var size = (undefined === parameters.size ? 0 : parameters.size),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            pointerType = (undefined === parameters.pointerType ? steelseries.PointerType.TYPE1 : parameters.pointerType),
	            pointerColor = (undefined === parameters.pointerColor ? (pointerType === steelseries.PointerType.TYPE1 ? steelseries.ColorDef.GRAY : steelseries.ColorDef.BLACK) : parameters.pointerColor),
	            backgroundColor = (undefined === parameters.backgroundColor ? (pointerType === steelseries.PointerType.TYPE1 ? steelseries.BackgroundColor.ANTHRACITE : steelseries.BackgroundColor.LIGHT_GRAY) : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
	            isAutomatic = (undefined === parameters.isAutomatic ? true : parameters.isAutomatic),
	            hour = (undefined === parameters.hour ? 11 : parameters.hour),
	            minute = (undefined === parameters.minute ? 5 : parameters.minute),
	            second = (undefined === parameters.second ? 0 : parameters.second),
	            secondMovesContinuous = (undefined === parameters.secondMovesContinuous ? false : parameters.secondMovesContinuous),
	            timeZoneOffsetHour = (undefined === parameters.timeZoneOffsetHour ? 0 : parameters.timeZoneOffsetHour),
	            timeZoneOffsetMinute = (undefined === parameters.timeZoneOffsetMinute ? 0 : parameters.timeZoneOffsetMinute),
	            secondPointerVisible = (undefined === parameters.secondPointerVisible ? true : parameters.secondPointerVisible);
	
	        // GaugeType specific private variables
	        var objDate = new Date();
	        var minutePointerAngle;
	        var hourPointerAngle;
	        var secondPointerAngle;
	        var tickTimer;
	        var tickInterval = (secondMovesContinuous ? 100 : 1000);
	        tickInterval = (secondPointerVisible ? tickInterval : 100);
	
	        var self = this;
	
	        // Constants
	        var ANGLE_STEP = 6;
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	        // Has a size been specified?
	        if (size === 0) {
	            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        var imageWidth = size;
	        var imageHeight = size;
	
	        var centerX = imageWidth / 2;
	        var centerY = imageHeight / 2;
	
	        var initialized = false;
	
	        // Buffer for the frame
	        var frameBuffer = createBuffer(size, size);
	        var frameContext = frameBuffer.getContext('2d');
	
	        // Buffer for static background painting code
	        var backgroundBuffer = createBuffer(size, size);
	        var backgroundContext = backgroundBuffer.getContext('2d');
	
	        // Buffer for hour pointer image painting code
	        var hourBuffer = createBuffer(size, size);
	        var hourContext = hourBuffer.getContext('2d');
	
	        // Buffer for minute pointer image painting code
	        var minuteBuffer = createBuffer(size, size);
	        var minuteContext = minuteBuffer.getContext('2d');
	
	        // Buffer for second pointer image painting code
	        var secondBuffer = createBuffer(size, size);
	        var secondContext = secondBuffer.getContext('2d');
	
	        // Buffer for static foreground painting code
	        var foregroundBuffer = createBuffer(size, size);
	        var foregroundContext = foregroundBuffer.getContext('2d');
	
	        var drawTickmarksImage = function (ctx, ptrType) {
	            var tickAngle;
	            var SMALL_TICK_HEIGHT;
	            var BIG_TICK_HEIGHT;
	            var OUTER_POINT, INNER_POINT;
	            OUTER_POINT = imageWidth * 0.405;
	            ctx.save();
	            ctx.translate(centerX, centerY);
	
	            switch (ptrType.type) {
	            case 'type1':
	                // Draw minutes tickmarks
	                SMALL_TICK_HEIGHT = imageWidth * 0.074766;
	                INNER_POINT = OUTER_POINT - SMALL_TICK_HEIGHT;
	                ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	                ctx.lineWidth = imageWidth * 0.014018;
	
	                for (tickAngle = 0; tickAngle < 360; tickAngle += 30) {
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                    ctx.rotate(30 * RAD_FACTOR);
	                }
	
	                // Draw hours tickmarks
	                BIG_TICK_HEIGHT = imageWidth * 0.126168;
	                INNER_POINT = OUTER_POINT - BIG_TICK_HEIGHT;
	                ctx.lineWidth = imageWidth * 0.032710;
	
	                for (tickAngle = 0; tickAngle < 360; tickAngle += 90) {
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                    ctx.rotate(90 * RAD_FACTOR);
	                }
	                break;
	
	            case 'type2':
	            /* falls through */
	            default:
	                // Draw minutes tickmarks
	                SMALL_TICK_HEIGHT = imageWidth * 0.037383;
	                INNER_POINT = OUTER_POINT - SMALL_TICK_HEIGHT;
	                ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	                ctx.lineWidth = imageWidth * 0.009345;
	
	                for (tickAngle = 0; tickAngle < 360; tickAngle += 6) {
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                    ctx.rotate(6 * RAD_FACTOR);
	                }
	
	                // Draw hours tickmarks
	                BIG_TICK_HEIGHT = imageWidth * 0.084112;
	                INNER_POINT = OUTER_POINT - BIG_TICK_HEIGHT;
	                ctx.lineWidth = imageWidth * 0.028037;
	
	                for (tickAngle = 0; tickAngle < 360; tickAngle += 30) {
	                    ctx.beginPath();
	                    ctx.moveTo(OUTER_POINT, 0);
	                    ctx.lineTo(INNER_POINT, 0);
	                    ctx.closePath();
	                    ctx.stroke();
	                    ctx.rotate(30 * RAD_FACTOR);
	                }
	                break;
	            }
	            ctx.translate(-centerX, -centerY);
	            ctx.restore();
	        };
	
	        var drawHourPointer = function (ctx, ptrType) {
	            ctx.save();
	            var grad;
	
	            switch (ptrType.type) {
	            case 'type2':
	                ctx.beginPath();
	                ctx.lineWidth = imageWidth * 0.046728;
	                ctx.moveTo(centerX, imageWidth * 0.289719);
	                ctx.lineTo(centerX, imageWidth * 0.289719 + imageWidth * 0.224299);
	                ctx.strokeStyle = pointerColor.medium.getRgbaColor();
	                ctx.closePath();
	                ctx.stroke();
	                break;
	
	            case 'type1':
	            /* falls through */
	            default:
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.471962, imageHeight * 0.560747);
	                ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.214953);
	                ctx.lineTo(imageWidth * 0.5, imageHeight * 0.182242);
	                ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.214953);
	                ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.560747);
	                ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.560747);
	                ctx.closePath();
	                grad = ctx.createLinearGradient(imageWidth * 0.471962, imageHeight * 0.560747, imageWidth * 0.528037, imageHeight * 0.214953);
	                grad.addColorStop(1, pointerColor.veryLight.getRgbaColor());
	                grad.addColorStop(0, pointerColor.light.getRgbaColor());
	                ctx.fillStyle = grad;
	                ctx.strokeStyle = pointerColor.light.getRgbaColor();
	                ctx.fill();
	                ctx.stroke();
	                break;
	            }
	            ctx.restore();
	        };
	
	        var drawMinutePointer = function (ctx, ptrType) {
	            ctx.save();
	            var grad;
	
	            switch (ptrType.type) {
	            case 'type2':
	                ctx.beginPath();
	                ctx.lineWidth = imageWidth * 0.032710;
	                ctx.moveTo(centerX, imageWidth * 0.116822);
	                ctx.lineTo(centerX, imageWidth * 0.116822 + imageWidth * 0.387850);
	                ctx.strokeStyle = pointerColor.medium.getRgbaColor();
	                ctx.closePath();
	                ctx.stroke();
	                break;
	
	            case 'type1':
	            /* falls through */
	            default:
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.574766);
	                ctx.lineTo(imageWidth * 0.523364, imageHeight * 0.135514);
	                ctx.lineTo(imageWidth * 0.5, imageHeight * 0.107476);
	                ctx.lineTo(imageWidth * 0.476635, imageHeight * 0.140186);
	                ctx.lineTo(imageWidth * 0.476635, imageHeight * 0.574766);
	                ctx.lineTo(imageWidth * 0.518691, imageHeight * 0.574766);
	                ctx.closePath();
	                grad = ctx.createLinearGradient(imageWidth * 0.518691, imageHeight * 0.574766, imageWidth * 0.476635, imageHeight * 0.140186);
	                grad.addColorStop(1, pointerColor.veryLight.getRgbaColor());
	                grad.addColorStop(0, pointerColor.light.getRgbaColor());
	                ctx.fillStyle = grad;
	                ctx.strokeStyle = pointerColor.light.getRgbaColor();
	                ctx.fill();
	                ctx.stroke();
	                break;
	            }
	            ctx.restore();
	        };
	
	        var drawSecondPointer = function (ctx, ptrType) {
	            ctx.save();
	            var grad;
	
	            switch (ptrType.type) {
	            case 'type2':
	                // top rectangle
	                ctx.lineWidth = imageWidth * 0.009345;
	                ctx.beginPath();
	                ctx.moveTo(centerX, imageWidth * 0.098130);
	                ctx.lineTo(centerX, imageWidth * 0.098130 + imageWidth * 0.126168);
	                ctx.closePath();
	                ctx.stroke();
	                // bottom rectangle
	                ctx.lineWidth = imageWidth * 0.018691;
	                ctx.beginPath();
	                ctx.moveTo(centerX, imageWidth * 0.308411);
	                ctx.lineTo(centerX, imageWidth * 0.308411 + imageWidth * 0.191588);
	                ctx.closePath();
	                ctx.stroke();
	                // circle
	                ctx.lineWidth = imageWidth * 0.016;
	                ctx.beginPath();
	                ctx.arc(centerX, imageWidth * 0.26, imageWidth * 0.085 / 2, 0, TWO_PI);
	                ctx.closePath();
	                ctx.stroke();
	                break;
	
	            case 'type1':
	            /* falls through */
	            default:
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.509345, imageHeight * 0.116822);
	                ctx.lineTo(imageWidth * 0.509345, imageHeight * 0.574766);
	                ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.574766);
	                ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.116822);
	                ctx.lineTo(imageWidth * 0.509345, imageHeight * 0.116822);
	                ctx.closePath();
	                grad = ctx.createLinearGradient(imageWidth * 0.509345, imageHeight * 0.116822, imageWidth * 0.490654, imageHeight * 0.574766);
	                grad.addColorStop(0, steelseries.ColorDef.RED.light.getRgbaColor());
	                grad.addColorStop(0.47, steelseries.ColorDef.RED.medium.getRgbaColor());
	                grad.addColorStop(1, steelseries.ColorDef.RED.dark.getRgbaColor());
	                ctx.fillStyle = grad;
	                ctx.strokeStyle = steelseries.ColorDef.RED.dark.getRgbaColor();
	                ctx.fill();
	                ctx.stroke();
	                break;
	            }
	            ctx.restore();
	        };
	
	        var drawKnob = function (ctx) {
	            var grad;
	
	            // draw the knob
	            ctx.beginPath();
	            ctx.arc(centerX, centerY, imageWidth * 0.045, 0, TWO_PI);
	            ctx.closePath();
	            grad = ctx.createLinearGradient(centerX - imageWidth * 0.045 / 2, centerY - imageWidth * 0.045 / 2, centerX + imageWidth * 0.045 / 2, centerY + imageWidth * 0.045 / 2);
	            grad.addColorStop(0, '#eef0f2');
	            grad.addColorStop(1, '#65696d');
	            ctx.fillStyle = grad;
	            ctx.fill();
	        };
	
	        var drawTopKnob = function (ctx, ptrType) {
	            var grad;
	
	            ctx.save();
	
	            switch (ptrType.type) {
	            case 'type2':
	                // draw knob
	                ctx.fillStyle = '#000000';
	                ctx.beginPath();
	                ctx.arc(centerX, centerY, imageWidth * 0.088785 / 2, 0, TWO_PI);
	                ctx.closePath();
	                ctx.fill();
	                break;
	
	            case 'type1':
	            /* falls through */
	            default:
	                // draw knob
	                grad = ctx.createLinearGradient(centerX - imageWidth * 0.027 / 2, centerY - imageWidth * 0.027 / 2, centerX + imageWidth * 0.027 / 2, centerY + imageWidth * 0.027 / 2);
	                grad.addColorStop(0, '#f3f4f7');
	                grad.addColorStop(0.11, '#f3f5f7');
	                grad.addColorStop(0.12, '#f1f3f5');
	                grad.addColorStop(0.2, '#c0c5cb');
	                grad.addColorStop(0.2, '#bec3c9');
	                grad.addColorStop(1, '#bec3c9');
	                ctx.fillStyle = grad;
	                ctx.beginPath();
	                ctx.arc(centerX, centerY, imageWidth * 0.027, 0, TWO_PI);
	                ctx.closePath();
	                ctx.fill();
	                break;
	            }
	
	            ctx.restore();
	        };
	
	        var calculateAngles = function (hour, minute, second) {
	            secondPointerAngle = second * ANGLE_STEP * RAD_FACTOR;
	            minutePointerAngle = minute * ANGLE_STEP * RAD_FACTOR;
	            hourPointerAngle = (hour + minute / 60) * ANGLE_STEP * 5 * RAD_FACTOR;
	        };
	
	        var tickTock = function () {
	            if (isAutomatic) {
	                objDate = new Date();
	            } else {
	                objDate.setHours(hour);
	                objDate.setMinutes(minute);
	                objDate.setSeconds(second);
	            }
	            // Seconds
	            second = objDate.getSeconds() + (secondMovesContinuous ? objDate.getMilliseconds() / 1000 : 0);
	
	            // Hours
	            if (timeZoneOffsetHour !== 0 && timeZoneOffsetMinute !== 0) {
	                hour = objDate.getUTCHours() + timeZoneOffsetHour;
	            } else {
	                hour = objDate.getHours();
	            }
	            hour = hour % 12;
	
	            // Minutes
	            if (timeZoneOffsetHour !== 0 && timeZoneOffsetMinute !== 0) {
	                minute = objDate.getUTCMinutes() + timeZoneOffsetMinute;
	            } else {
	                minute = objDate.getMinutes();
	            }
	            if (minute > 60) {
	                minute -= 60;
	                hour++;
	            }
	            if (minute < 0) {
	                minute += 60;
	                hour--;
	            }
	            hour = hour % 12;
	            // Calculate angles from current hour and minute values
	            calculateAngles(hour, minute, second);
	
	            if (isAutomatic) {
	                tickTimer = setTimeout(tickTock, tickInterval);
	            }
	
	            self.repaint();
	        };
	
	        // **************   Initialization  ********************
	        // Draw all static painting code to background
	        var init = function (parameters) {
	            parameters = parameters || {};
	            var drawFrame = (undefined === parameters.frame ? false : parameters.frame);
	            var drawBackground = (undefined === parameters.background ? false : parameters.background);
	            var drawPointers = (undefined === parameters.pointers ? false : parameters.pointers);
	            var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
	
	            initialized = true;
	
	            if (drawFrame && frameVisible) {
	                drawRadialFrameImage(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            if (drawBackground && backgroundVisible) {
	                // Create background in background buffer (backgroundBuffer)
	                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
	
	                // Create custom layer in background buffer (backgroundBuffer)
	                drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
	
	                drawTickmarksImage(backgroundContext, pointerType);
	            }
	
	            if (drawPointers) {
	                drawHourPointer(hourContext, pointerType);
	                drawMinutePointer(minuteContext, pointerType);
	                drawSecondPointer(secondContext, pointerType);
	            }
	
	            if (drawForeground && foregroundVisible) {
	                drawTopKnob(foregroundContext, pointerType);
	                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, false);
	            }
	        };
	
	        var resetBuffers = function (buffers) {
	            buffers = buffers || {};
	            var resetFrame = (undefined === buffers.frame ? false : buffers.frame);
	            var resetBackground = (undefined === buffers.background ? false : buffers.background);
	            var resetPointers = (undefined === buffers.pointers ? false : buffers.pointers);
	            var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);
	
	            if (resetFrame) {
	                frameBuffer.width = size;
	                frameBuffer.height = size;
	                frameContext = frameBuffer.getContext('2d');
	            }
	
	            if (resetBackground) {
	                backgroundBuffer.width = size;
	                backgroundBuffer.height = size;
	                backgroundContext = backgroundBuffer.getContext('2d');
	            }
	
	            if (resetPointers) {
	                hourBuffer.width = size;
	                hourBuffer.height = size;
	                hourContext = hourBuffer.getContext('2d');
	
	                minuteBuffer.width = size;
	                minuteBuffer.height = size;
	                minuteContext = minuteBuffer.getContext('2d');
	
	                secondBuffer.width = size;
	                secondBuffer.height = size;
	                secondContext = secondBuffer.getContext('2d');
	            }
	
	            if (resetForeground) {
	                foregroundBuffer.width = size;
	                foregroundBuffer.height = size;
	                foregroundContext = foregroundBuffer.getContext('2d');
	            }
	        };
	
	        //************************************ Public methods **************************************
	        this.getAutomatic = function () {
	            return isAutomatic;
	        };
	
	        this.setAutomatic = function (newValue) {
	            newValue = !!newValue;
	            if (isAutomatic && !newValue) {
	                // stop the clock!
	                clearTimeout(tickTimer);
	                isAutomatic = newValue;
	            } else if (!isAutomatic && newValue) {
	                // start the clock
	                isAutomatic = newValue;
	                tickTock();
	            }
	            return this;
	        };
	
	        this.getHour = function () {
	            return hour;
	        };
	
	        this.setHour = function (newValue) {
	            newValue = parseInt(newValue, 10) % 12;
	            if (hour !== newValue) {
	                hour = newValue;
	                calculateAngles(hour, minute, second);
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getMinute = function () {
	            return minute;
	        };
	
	        this.setMinute = function (newValue) {
	            newValue = parseInt(newValue, 10) % 60;
	            if (minute !== newValue) {
	                minute = newValue;
	                calculateAngles(hour, minute, second);
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getSecond = function () {
	            return second;
	        };
	
	        this.setSecond = function (newValue) {
	            second = parseInt(newValue, 10) % 60;
	            if (second !== newValue) {
	                second = newValue;
	                calculateAngles(hour, minute, second);
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getTimeZoneOffsetHour = function () {
	            return timeZoneOffsetHour;
	        };
	
	        this.setTimeZoneOffsetHour = function (newValue) {
	            timeZoneOffsetHour = parseInt(newValue, 10);
	            this.repaint();
	            return this;
	        };
	
	        this.getTimeZoneOffsetMinute = function () {
	            return timeZoneOffsetMinute;
	        };
	
	        this.setTimeZoneOffsetMinute = function (newValue) {
	            timeZoneOffsetMinute = parseInt(newValue, 10);
	            this.repaint();
	            return this;
	        };
	
	        this.getSecondPointerVisible = function () {
	            return secondPointerVisible;
	        };
	
	        this.setSecondPointerVisible = function (newValue) {
	            secondPointerVisible = !!newValue;
	            this.repaint();
	            return this;
	        };
	
	        this.getSecondMovesContinuous = function () {
	            return secondMovesContinuous;
	        };
	
	        this.setSecondMovesContinuous = function (newValue) {
	            secondMovesContinuous = !!newValue;
	            tickInterval = (secondMovesContinuous ? 100 : 1000);
	            tickInterval = (secondPointerVisible ? tickInterval : 100);
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers({frame: true});
	            frameDesign = newFrameDesign;
	            init({frame: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers({ frame: true,
	                           background: true });
	            backgroundColor = newBackgroundColor;
	            init({ frame: true,
	                   background: true });
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers({foreground: true});
	            foregroundType = newForegroundType;
	            init({foreground: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerType = function (newPointerType) {
	            resetBuffers({ background: true,
	                           foreground: true,
	                           pointers: true });
	            pointerType = newPointerType;
	            if (pointerType.type === 'type1') {
	                pointerColor = steelseries.ColorDef.GRAY;
	                backgroundColor = steelseries.BackgroundColor.ANTHRACITE;
	            } else {
	                pointerColor = steelseries.ColorDef.BLACK;
	                backgroundColor = steelseries.BackgroundColor.LIGHT_GRAY;
	            }
	            init({ background: true,
	                   foreground: true,
	                   pointers: true });
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerColor = function (newPointerColor) {
	            resetBuffers({pointers: true});
	            pointerColor = newPointerColor;
	            init({pointers: true});
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init({frame: true,
	                      background: true,
	                      pointers: true,
	                      foreground: true});
	            }
	
	            //mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            // Draw frame
	            if (frameVisible) {
	                mainCtx.drawImage(frameBuffer, 0, 0);
	            }
	
	            // Draw buffered image to visible canvas
	            if (backgroundVisible) {
	                mainCtx.drawImage(backgroundBuffer, 0, 0);
	            }
	
	            // have to draw to a rotated temporary image area so we can translate in
	            // absolute x, y values when drawing to main context
	            var shadowOffset = imageWidth * 0.006;
	
	            // draw hour pointer
	            // Define rotation center
	            mainCtx.save();
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(hourPointerAngle);
	            mainCtx.translate(-centerX, -centerY);
	            // Set the pointer shadow params
	            mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
	            mainCtx.shadowBlur = shadowOffset * 2;
	            // Draw the pointer
	            mainCtx.drawImage(hourBuffer, 0, 0);
	
	            // draw minute pointer
	            // Define rotation center
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(minutePointerAngle - hourPointerAngle);
	            mainCtx.translate(-centerX, -centerY);
	            mainCtx.drawImage(minuteBuffer, 0, 0);
	            mainCtx.restore();
	
	            if (pointerType.type === 'type1') {
	                drawKnob(mainCtx);
	            }
	
	            if (secondPointerVisible) {
	                // draw second pointer
	                // Define rotation center
	                mainCtx.save();
	                mainCtx.translate(centerX, centerY);
	                mainCtx.rotate(secondPointerAngle);
	                mainCtx.translate(-centerX, -centerY);
	                // Set the pointer shadow params
	                mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	                mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
	                mainCtx.shadowBlur = shadowOffset * 2;
	                // Draw the pointer
	                mainCtx.drawImage(secondBuffer, 0, 0);
	                mainCtx.restore();
	            }
	
	            // Draw foreground
	            if (foregroundVisible) {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	        };
	
	        // Visualize the component
	        tickTock();
	
	        return this;
	    };
	
	    var battery = function (canvas, parameters) {
	        parameters = parameters || {};
	        var size = (undefined === parameters.size ? 0 : parameters.size),
	            value = (undefined === parameters.value ? 50 : parameters.value);
	
	        // Get the canvas context and clear it
	        var mainCtx = getCanvasContext(canvas);
	
	        // Has a size been specified?
	        if (size === 0) {
	            size = mainCtx.canvas.width;
	        }
	
	        var imageWidth = size;
	        var imageHeight = Math.ceil(size * 0.45);
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = imageWidth;
	        mainCtx.canvas.height = imageHeight;
	
	        var createBatteryImage = function (ctx, imageWidth, imageHeight, value) {
	            var grad;
	
	            // Background
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.025, imageHeight * 0.055555);
	            ctx.lineTo(imageWidth * 0.9, imageHeight * 0.055555);
	            ctx.lineTo(imageWidth * 0.9, imageHeight * 0.944444);
	            ctx.lineTo(imageWidth * 0.025, imageHeight * 0.944444);
	            ctx.lineTo(imageWidth * 0.025, imageHeight * 0.055555);
	            ctx.closePath();
	            //
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.925, 0);
	            ctx.lineTo(0, 0);
	            ctx.lineTo(0, imageHeight);
	            ctx.lineTo(imageWidth * 0.925, imageHeight);
	            ctx.lineTo(imageWidth * 0.925, imageHeight * 0.722222);
	            ctx.bezierCurveTo(imageWidth * 0.925, imageHeight * 0.722222, imageWidth * 0.975, imageHeight * 0.722222, imageWidth * 0.975, imageHeight * 0.722222);
	            ctx.bezierCurveTo(imageWidth, imageHeight * 0.722222, imageWidth, imageHeight * 0.666666, imageWidth, imageHeight * 0.666666);
	            ctx.bezierCurveTo(imageWidth, imageHeight * 0.666666, imageWidth, imageHeight * 0.333333, imageWidth, imageHeight * 0.333333);
	            ctx.bezierCurveTo(imageWidth, imageHeight * 0.333333, imageWidth, imageHeight * 0.277777, imageWidth * 0.975, imageHeight * 0.277777);
	            ctx.bezierCurveTo(imageWidth * 0.975, imageHeight * 0.277777, imageWidth * 0.925, imageHeight * 0.277777, imageWidth * 0.925, imageHeight * 0.277777);
	            ctx.lineTo(imageWidth * 0.925, 0);
	            ctx.closePath();
	            //
	            grad = ctx.createLinearGradient(0, 0, 0, imageHeight);
	            grad.addColorStop(0, '#ffffff');
	            grad.addColorStop(1, '#7e7e7e');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // Main
	            ctx.beginPath();
	            var end = Math.max(imageWidth * 0.875 * (value / 100), Math.ceil(imageWidth * 0.01));
	            ctx.rect(imageWidth * 0.025, imageWidth * 0.025, end, imageHeight * 0.888888);
	            ctx.closePath();
	            var BORDER_FRACTIONS = [0, 0.4, 1];
	            var BORDER_COLORS = [new RgbaColor(177, 25, 2, 1),   // 0xB11902
	                                 new RgbaColor(219, 167, 21, 1), // 0xDBA715
	                                 new RgbaColor(121, 162, 75, 1)  // 0x79A24B
	                                ];
	            var border = new GradientWrapper(0, 100, BORDER_FRACTIONS, BORDER_COLORS);
	            ctx.fillStyle = border.getColorAt(value / 100).getRgbColor();
	            ctx.fill();
	            ctx.beginPath();
	            end = Math.max(end - imageWidth * 0.05, 0);
	            ctx.rect(imageWidth * 0.05, imageWidth * 0.05, end, imageHeight * 0.777777);
	            ctx.closePath();
	            var LIQUID_COLORS_DARK = [new RgbaColor(198, 39, 5, 1),   // 0xC62705
	                                      new RgbaColor(228, 189, 32, 1), // 0xE4BD20
	                                      new RgbaColor(163, 216, 102, 1) // 0xA3D866
	                                    ];
	
	            var LIQUID_COLORS_LIGHT = [new RgbaColor(246, 121, 48, 1),   // 0xF67930
	                                       new RgbaColor(246, 244, 157, 1),  // 0xF6F49D
	                                       new RgbaColor(223, 233, 86, 1)    // 0xDFE956
	                                      ];
	            var LIQUID_GRADIENT_FRACTIONS = [0, 0.4, 1];
	            var liquidDark = new GradientWrapper(0, 100, LIQUID_GRADIENT_FRACTIONS, LIQUID_COLORS_DARK);
	            var liquidLight = new GradientWrapper(0, 100, LIQUID_GRADIENT_FRACTIONS, LIQUID_COLORS_LIGHT);
	            grad = ctx.createLinearGradient(imageWidth * 0.05, 0, imageWidth * 0.875, 0);
	            grad.addColorStop(0, liquidDark.getColorAt(value / 100).getRgbColor());
	            grad.addColorStop(0.5, liquidLight.getColorAt(value / 100).getRgbColor());
	            grad.addColorStop(1, liquidDark.getColorAt(value / 100).getRgbColor());
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // Foreground
	            ctx.beginPath();
	            ctx.rect(imageWidth * 0.025, imageWidth * 0.025, imageWidth * 0.875, imageHeight * 0.444444);
	            ctx.closePath();
	            grad = ctx.createLinearGradient(imageWidth * 0.025, imageWidth * 0.025, imageWidth * 0.875, imageHeight * 0.444444);
	            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
	            grad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
	            ctx.fillStyle = grad;
	            ctx.fill();
	        };
	
	        // **************   Public methods  ********************
	        this.setValue = function (newValue) {
	            newValue = (newValue < 0 ? 0 : (newValue > 100 ? 100 : newValue));
	            if (value !== newValue) {
	                value = newValue;
	                this.repaint();
	            }
	            return this;
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.repaint = function () {
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	            createBatteryImage(mainCtx, imageWidth, imageHeight, value);
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var stopwatch = function (canvas, parameters) {
	        parameters = parameters || {};
	        var size = (undefined === parameters.size ? 0 : parameters.size),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            pointerColor = (undefined === parameters.pointerColor ? steelseries.ColorDef.BLACK : parameters.pointerColor),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.LIGHT_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
	
	            minutePointerAngle = 0,
	            secondPointerAngle = 0,
	            tickTimer,
	            ANGLE_STEP = 6,
	            self = this,
	
	            start = 0,
	            currentMilliSeconds = 0,
	            minutes = 0,
	            seconds = 0,
	            milliSeconds = 0,
	            running = false,
	            lap = false,
	            // Get the canvas context
	            mainCtx = getCanvasContext(canvas),
	
	            imageWidth, imageHeight,
	            centerX, centerY,
	
	            smallPointerSize, smallPointerX_Offset, smallPointerY_Offset,
	
	            initialized = false,
	
	            // Buffer for the frame
	            frameBuffer, frameContext,
	
	            // Buffer for static background painting code
	            backgroundBuffer, backgroundContext,
	
	            // Buffer for small pointer image painting code
	            smallPointerBuffer, smallPointerContext,
	
	            // Buffer for large pointer image painting code
	            largePointerBuffer, largePointerContext,
	
	            // Buffer for static foreground painting code
	            foregroundBuffer, foregroundContext,
	
	            drawTickmarksImage = function (ctx, width, range, text_scale, text_dist_factor, x_offset, y_offset) {
	                var STD_FONT_SIZE = text_scale * width,
	                    STD_FONT = STD_FONT_SIZE + 'px ' + stdFontName,
	                    TEXT_WIDTH = width * 0.15,
	                    THIN_STROKE = 0.5,
	                    MEDIUM_STROKE = 1,
	                    THICK_STROKE = 1.5,
	                    TEXT_DISTANCE = text_dist_factor * width,
	                    MIN_LENGTH = Math.round(0.025 * width),
	                    MED_LENGTH = Math.round(0.035 * width),
	                    MAX_LENGTH = Math.round(0.045 * width),
	                    TEXT_COLOR = backgroundColor.labelColor.getRgbaColor(),
	                    TICK_COLOR = backgroundColor.labelColor.getRgbaColor(),
	                    CENTER = width / 2,
	                    // Create the ticks itself
	                    RADIUS = width * 0.4,
	                    innerPoint, outerPoint, textPoint,
	                    counter = 0,
	                    numberCounter = 0,
	                    tickCounter = 0,
	                    valueCounter, // value for the tickmarks
	                    sinValue = 0,
	                    cosValue = 0,
	                    alpha, // angle for the tickmarks
	                    ALPHA_START = -PI,
	                    ANGLE_STEPSIZE = TWO_PI / (range);
	
	                ctx.width = ctx.height = width;
	                ctx.save();
	                ctx.textAlign = 'center';
	                ctx.textBaseline = 'middle';
	                ctx.font = STD_FONT;
	
	                for (alpha = ALPHA_START, valueCounter = 0; valueCounter <= range + 1; alpha -= ANGLE_STEPSIZE * 0.1, valueCounter += 0.1) {
	                    ctx.lineWidth = THIN_STROKE;
	                    sinValue = Math.sin(alpha);
	                    cosValue = Math.cos(alpha);
	
	                    // tickmark every 2 units
	                    if (counter % 2 === 0) {
	                        //ctx.lineWidth = THIN_STROKE;
	                        innerPoint = [CENTER + (RADIUS - MIN_LENGTH) * sinValue + x_offset, CENTER + (RADIUS - MIN_LENGTH) * cosValue + y_offset];
	                        outerPoint = [CENTER + RADIUS * sinValue + x_offset, CENTER + RADIUS * cosValue + y_offset];
	                        // Draw ticks
	                        ctx.strokeStyle = TICK_COLOR;
	                        ctx.beginPath();
	                        ctx.moveTo(innerPoint[0], innerPoint[1]);
	                        ctx.lineTo(outerPoint[0], outerPoint[1]);
	                        ctx.closePath();
	                        ctx.stroke();
	                    }
	
	                    // Different tickmark every 10 units
	                    if (counter === 10 || counter === 0) {
	                        ctx.fillStyle = TEXT_COLOR;
	                        ctx.lineWidth = MEDIUM_STROKE;
	                        outerPoint = [CENTER + RADIUS * sinValue + x_offset, CENTER + RADIUS * cosValue + y_offset];
	                        textPoint  = [CENTER + (RADIUS - TEXT_DISTANCE) * sinValue + x_offset, CENTER + (RADIUS - TEXT_DISTANCE) * cosValue + y_offset];
	
	                        // Draw text
	                        if (numberCounter === 5) {
	                            if (valueCounter !== range) {
	                                if (Math.round(valueCounter) !== 60) {
	                                    ctx.fillText(Math.round(valueCounter), textPoint[0], textPoint[1], TEXT_WIDTH);
	                                }
	                            }
	                            ctx.lineWidth = THICK_STROKE;
	                            innerPoint = [CENTER + (RADIUS - MAX_LENGTH) * sinValue + x_offset, CENTER + (RADIUS - MAX_LENGTH) * cosValue + y_offset];
	                            numberCounter = 0;
	                        } else {
	                            ctx.lineWidth = MEDIUM_STROKE;
	                            innerPoint = [CENTER + (RADIUS - MED_LENGTH) * sinValue + x_offset, CENTER + (RADIUS - MED_LENGTH) * cosValue + y_offset];
	                        }
	
	                        // Draw ticks
	                        ctx.strokeStyle = TICK_COLOR;
	                        ctx.beginPath();
	                        ctx.moveTo(innerPoint[0], innerPoint[1]);
	                        ctx.lineTo(outerPoint[0], outerPoint[1]);
	                        ctx.closePath();
	                        ctx.stroke();
	
	                        counter = 0;
	                        tickCounter++;
	                        numberCounter++;
	                    }
	                    counter++;
	                }
	                ctx.restore();
	            },
	
	            drawLargePointer = function (ctx) {
	                var grad, radius;
	
	                ctx.save();
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.509345, imageWidth * 0.457943);
	                ctx.lineTo(imageWidth * 0.5, imageWidth * 0.102803);
	                ctx.lineTo(imageWidth * 0.490654, imageWidth * 0.457943);
	                ctx.bezierCurveTo(imageWidth * 0.490654, imageWidth * 0.457943, imageWidth * 0.490654, imageWidth * 0.457943, imageWidth * 0.490654, imageWidth * 0.457943);
	                ctx.bezierCurveTo(imageWidth * 0.471962, imageWidth * 0.462616, imageWidth * 0.457943, imageWidth * 0.481308, imageWidth * 0.457943, imageWidth * 0.5);
	                ctx.bezierCurveTo(imageWidth * 0.457943, imageWidth * 0.518691, imageWidth * 0.471962, imageWidth * 0.537383, imageWidth * 0.490654, imageWidth * 0.542056);
	                ctx.bezierCurveTo(imageWidth * 0.490654, imageWidth * 0.542056, imageWidth * 0.490654, imageWidth * 0.542056, imageWidth * 0.490654, imageWidth * 0.542056);
	                ctx.lineTo(imageWidth * 0.490654, imageWidth * 0.621495);
	                ctx.lineTo(imageWidth * 0.509345, imageWidth * 0.621495);
	                ctx.lineTo(imageWidth * 0.509345, imageWidth * 0.542056);
	                ctx.bezierCurveTo(imageWidth * 0.509345, imageWidth * 0.542056, imageWidth * 0.509345, imageWidth * 0.542056, imageWidth * 0.509345, imageWidth * 0.542056);
	                ctx.bezierCurveTo(imageWidth * 0.528037, imageWidth * 0.537383, imageWidth * 0.542056, imageWidth * 0.518691, imageWidth * 0.542056, imageWidth * 0.5);
	                ctx.bezierCurveTo(imageWidth * 0.542056, imageWidth * 0.481308, imageWidth * 0.528037, imageWidth * 0.462616, imageWidth * 0.509345, imageWidth * 0.457943);
	                ctx.bezierCurveTo(imageWidth * 0.509345, imageWidth * 0.457943, imageWidth * 0.509345, imageWidth * 0.457943, imageWidth * 0.509345, imageWidth * 0.457943);
	                ctx.closePath();
	                grad = ctx.createLinearGradient(0, 0, 0, imageWidth * 0.621495);
	                grad.addColorStop(0, pointerColor.medium.getRgbaColor());
	                grad.addColorStop(0.388888, pointerColor.medium.getRgbaColor());
	                grad.addColorStop(0.5, pointerColor.light.getRgbaColor());
	                grad.addColorStop(0.611111, pointerColor.medium.getRgbaColor());
	                grad.addColorStop(1, pointerColor.medium.getRgbaColor());
	                ctx.fillStyle = grad;
	                ctx.strokeStyle = pointerColor.dark.getRgbaColor();
	                ctx.fill();
	                ctx.stroke();
	                // Draw the rings
	                ctx.beginPath();
	                radius = imageWidth * 0.065420 / 2;
	                ctx.arc(centerX, centerY, radius, 0, TWO_PI);
	                grad = ctx.createLinearGradient(centerX - radius, centerX + radius, 0, centerX + radius);
	                grad.addColorStop(0, '#e6b35c');
	                grad.addColorStop(0.01, '#e6b35c');
	                grad.addColorStop(0.99, '#c48200');
	                grad.addColorStop(1, '#c48200');
	                ctx.fillStyle = grad;
	                ctx.closePath();
	                ctx.fill();
	                ctx.beginPath();
	                radius = imageWidth * 0.046728 / 2;
	                ctx.arc(centerX, centerY, radius, 0, TWO_PI);
	                grad = ctx.createRadialGradient(centerX, centerX, 0, centerX, centerX, radius);
	                grad.addColorStop(0, '#c5c5c5');
	                grad.addColorStop(0.19, '#c5c5c5');
	                grad.addColorStop(0.22, '#000000');
	                grad.addColorStop(0.8, '#000000');
	                grad.addColorStop(0.99, '#707070');
	                grad.addColorStop(1, '#707070');
	                ctx.fillStyle = grad;
	                ctx.closePath();
	                ctx.fill();
	                ctx.restore();
	            },
	
	            drawSmallPointer = function (ctx) {
	                var grad, radius;
	
	                ctx.save();
	                ctx.beginPath();
	                ctx.moveTo(imageWidth * 0.476635, imageWidth * 0.313084);
	                ctx.bezierCurveTo(imageWidth * 0.476635, imageWidth * 0.322429, imageWidth * 0.485981, imageWidth * 0.331775, imageWidth * 0.495327, imageWidth * 0.336448);
	                ctx.bezierCurveTo(imageWidth * 0.495327, imageWidth * 0.336448, imageWidth * 0.495327, imageWidth * 0.350467, imageWidth * 0.495327, imageWidth * 0.350467);
	                ctx.lineTo(imageWidth * 0.504672, imageWidth * 0.350467);
	                ctx.bezierCurveTo(imageWidth * 0.504672, imageWidth * 0.350467, imageWidth * 0.504672, imageWidth * 0.336448, imageWidth * 0.504672, imageWidth * 0.336448);
	                ctx.bezierCurveTo(imageWidth * 0.514018, imageWidth * 0.331775, imageWidth * 0.523364, imageWidth * 0.322429, imageWidth * 0.523364, imageWidth * 0.313084);
	                ctx.bezierCurveTo(imageWidth * 0.523364, imageWidth * 0.303738, imageWidth * 0.514018, imageWidth * 0.294392, imageWidth * 0.504672, imageWidth * 0.289719);
	                ctx.bezierCurveTo(imageWidth * 0.504672, imageWidth * 0.289719, imageWidth * 0.5, imageWidth * 0.200934, imageWidth * 0.5, imageWidth * 0.200934);
	                ctx.bezierCurveTo(imageWidth * 0.5, imageWidth * 0.200934, imageWidth * 0.495327, imageWidth * 0.289719, imageWidth * 0.495327, imageWidth * 0.289719);
	                ctx.bezierCurveTo(imageWidth * 0.485981, imageWidth * 0.294392, imageWidth * 0.476635, imageWidth * 0.303738, imageWidth * 0.476635, imageWidth * 0.313084);
	                ctx.closePath();
	                grad = ctx.createLinearGradient(0, 0, imageWidth, 0);
	                grad.addColorStop(0, pointerColor.medium.getRgbaColor());
	                grad.addColorStop(0.388888, pointerColor.medium.getRgbaColor());
	                grad.addColorStop(0.5, pointerColor.light.getRgbaColor());
	                grad.addColorStop(0.611111, pointerColor.medium.getRgbaColor());
	                grad.addColorStop(1, pointerColor.medium.getRgbaColor());
	                ctx.fillStyle = grad;
	                ctx.strokeStyle = pointerColor.dark.getRgbaColor();
	                ctx.fill();
	                ctx.stroke();
	                // Draw the rings
	                ctx.beginPath();
	                radius = imageWidth * 0.037383 / 2;
	                ctx.arc(centerX, smallPointerY_Offset + smallPointerSize / 2, radius, 0, TWO_PI);
	                ctx.fillStyle = '#C48200';
	                ctx.closePath();
	                ctx.fill();
	                ctx.beginPath();
	                radius = imageWidth * 0.028037 / 2;
	                ctx.arc(centerX, smallPointerY_Offset + smallPointerSize / 2, radius, 0, TWO_PI);
	                ctx.fillStyle = '#999999';
	                ctx.closePath();
	                ctx.fill();
	                ctx.beginPath();
	                radius = imageWidth * 0.018691 / 2;
	                ctx.arc(centerX, smallPointerY_Offset + smallPointerSize / 2, radius, 0, TWO_PI);
	                ctx.fillStyle = '#000000';
	                ctx.closePath();
	                ctx.fill();
	                ctx.restore();
	            },
	
	            calculateAngles = function () {
	                currentMilliSeconds = new Date().getTime() - start;
	                secondPointerAngle = (currentMilliSeconds * ANGLE_STEP / 1000);
	                minutePointerAngle = (secondPointerAngle % 10800) / 30;
	
	                minutes = (currentMilliSeconds / 60000) % 30;
	                seconds = (currentMilliSeconds / 1000) % 60;
	                milliSeconds = (currentMilliSeconds) % 1000;
	            },
	
	            init = function (parameters) {
	                parameters = parameters || {};
	                var drawFrame = (undefined === parameters.frame ? false : parameters.frame),
	                    drawBackground = (undefined === parameters.background ? false : parameters.background),
	                    drawPointers = (undefined === parameters.pointers ? false : parameters.pointers),
	                    drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
	
	                initialized = true;
	
	                if (drawFrame && frameVisible) {
	                    drawRadialFrameImage(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
	                }
	
	                if (drawBackground && backgroundVisible) {
	                    // Create background in background buffer (backgroundBuffer)
	                    drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
	
	                    // Create custom layer in background buffer (backgroundBuffer)
	                    drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
	
	                    drawTickmarksImage(backgroundContext, imageWidth, 60, 0.075, 0.1, 0, 0);
	                    drawTickmarksImage(backgroundContext, smallPointerSize, 30, 0.095, 0.13, smallPointerX_Offset, smallPointerY_Offset);
	                }
	                if (drawPointers) {
	                    drawLargePointer(largePointerContext);
	                    drawSmallPointer(smallPointerContext);
	                }
	
	                if (drawForeground && foregroundVisible) {
	                    drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, false);
	                }
	            },
	
	            resetBuffers = function (buffers) {
	                buffers = buffers || {};
	                var resetFrame = (undefined === buffers.frame ? false : buffers.frame),
	                    resetBackground = (undefined === buffers.background ? false : buffers.background),
	                    resetPointers = (undefined === buffers.pointers ? false : buffers.pointers),
	                    resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);
	
	                if (resetFrame) {
	                    frameBuffer.width = size;
	                    frameBuffer.height = size;
	                    frameContext = frameBuffer.getContext('2d');
	                }
	
	                if (resetBackground) {
	                    backgroundBuffer.width = size;
	                    backgroundBuffer.height = size;
	                    backgroundContext = backgroundBuffer.getContext('2d');
	                }
	
	                if (resetPointers) {
	                    smallPointerBuffer.width = size;
	                    smallPointerBuffer.height = size;
	                    smallPointerContext = smallPointerBuffer.getContext('2d');
	
	                    largePointerBuffer.width = size;
	                    largePointerBuffer.height = size;
	                    largePointerContext = largePointerBuffer.getContext('2d');
	                }
	
	                if (resetForeground) {
	                    foregroundBuffer.width = size;
	                    foregroundBuffer.height = size;
	                    foregroundContext = foregroundBuffer.getContext('2d');
	                }
	            },
	
	            tickTock = function () {
	                if (!lap) {
	                    calculateAngles();
	                    self.repaint();
	                }
	                if (running) {
	                    tickTimer = setTimeout(tickTock, 200);
	                }
	
	            };
	
	        //************************************ Public methods **************************************
	        // Returns true if the stopwatch is running
	        this.isRunning = function () {
	            return running;
	        };
	
	        // Starts the stopwatch
	        this.start = function () {
	            if (!running) {
	                running = true;
	                start = new Date().getTime() - currentMilliSeconds;
	                tickTock();
	            }
	            return this;
	        };
	
	        // Stops the stopwatch
	        this.stop = function () {
	            if (running) {
	                running = false;
	                clearTimeout(tickTimer);
	                //calculateAngles();
	            }
	            if (lap) {
	                lap = false;
	                calculateAngles();
	                this.repaint();
	            }
	            return this;
	        };
	
	        // Resets the stopwatch
	        this.reset = function () {
	            if (running) {
	                running = false;
	                lap = false;
	                clearTimeout(tickTimer);
	            }
	            start = new Date().getTime();
	            calculateAngles();
	            this.repaint();
	            return this;
	        };
	
	        // Laptimer, stop/restart stopwatch
	        this.lap = function () {
	            if (running && !lap) {
	                lap = true;
	            } else if (lap) {
	                lap = false;
	            }
	            return this;
	        };
	
	        this.getMeasuredTime = function () {
	            return (minutes + ':' + seconds + ':' + milliSeconds);
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers({frame: true});
	            frameDesign = newFrameDesign;
	            init({frame: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers({ background: true });
	            backgroundColor = newBackgroundColor;
	            init({ background: true });
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers({foreground: true});
	            foregroundType = newForegroundType;
	            init({foreground: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setPointerColor = function (newPointerColor) {
	            resetBuffers({pointers: true});
	            pointerColor = newPointerColor;
	            init({pointers: true});
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init({frame: true,
	                      background: true,
	                      pointers: true,
	                      foreground: true});
	            }
	
	            mainCtx.clearRect(0, 0, imageWidth, imageHeight);
	
	            // Draw frame
	            if (frameVisible) {
	                mainCtx.drawImage(frameBuffer, 0, 0);
	            }
	
	            // Draw buffered image to visible canvas
	            if (backgroundVisible) {
	                mainCtx.drawImage(backgroundBuffer, 0, 0);
	            }
	
	            // have to draw to a rotated temporary image area so we can translate in
	            // absolute x, y values when drawing to main context
	            var shadowOffset = imageWidth * 0.006;
	
	            var rotationAngle = (minutePointerAngle + (2 * Math.sin(minutePointerAngle * RAD_FACTOR))) * RAD_FACTOR;
	            var secRotationAngle = (secondPointerAngle + (2 * Math.sin(secondPointerAngle * RAD_FACTOR))) * RAD_FACTOR;
	
	            // Draw the minute pointer
	            // Define rotation center
	            mainCtx.save();
	            mainCtx.translate(centerX, smallPointerY_Offset + smallPointerSize / 2);
	            mainCtx.rotate(rotationAngle);
	            mainCtx.translate(-centerX, -(smallPointerY_Offset + smallPointerSize / 2));
	            // Set the pointer shadow params
	            mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset / 2;
	            mainCtx.shadowBlur = shadowOffset;
	            // Draw the pointer
	            mainCtx.drawImage(smallPointerBuffer, 0, 0);
	            mainCtx.restore();
	
	            // Draw the second pointer
	            // Define rotation center
	            mainCtx.save();
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate(secRotationAngle);
	            mainCtx.translate(-centerX, -centerY);
	            // Set the pointer shadow params
	            mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset / 2;
	            mainCtx.shadowBlur = shadowOffset;
	            // Draw the pointer
	            mainCtx.drawImage(largePointerBuffer, 0, 0);
	            // Undo the translations & shadow settings
	            mainCtx.restore();
	
	            // Draw the foreground
	            if (foregroundVisible) {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	        };
	
	        // Has a size been specified?
	        size = (size === 0 ? Math.min(mainCtx.canvas.width, mainCtx.canvas.height) : size);
	
	        // Set the size - also clears it
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        imageWidth = size;
	        imageHeight = size;
	
	        centerX = imageWidth / 2;
	        centerY = imageHeight / 2;
	
	        smallPointerSize = 0.285 * imageWidth;
	        smallPointerX_Offset = centerX - smallPointerSize / 2;
	        smallPointerY_Offset = 0.17 * imageWidth;
	
	        // Buffer for the frame
	        frameBuffer = createBuffer(size, size);
	        frameContext = frameBuffer.getContext('2d');
	
	        // Buffer for static background painting code
	        backgroundBuffer = createBuffer(size, size);
	        backgroundContext = backgroundBuffer.getContext('2d');
	
	        // Buffer for small pointer image painting code
	        smallPointerBuffer = createBuffer(size, size);
	        smallPointerContext = smallPointerBuffer.getContext('2d');
	
	        // Buffer for large pointer image painting code
	        largePointerBuffer = createBuffer(size, size);
	        largePointerContext = largePointerBuffer.getContext('2d');
	
	        // Buffer for static foreground painting code
	        foregroundBuffer = createBuffer(size, size);
	        foregroundContext = foregroundBuffer.getContext('2d');
	
	        // Visualize the component
	        start = new Date().getTime();
	        tickTock();
	
	        return this;
	    };
	
	    var altimeter = function (canvas, parameters) {
	        parameters = parameters || {};
	            // parameters
	        var size = (undefined === parameters.size ? 0 : parameters.size),
	            frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
	            frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
	            backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
	            backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
	            knobType = (undefined === parameters.knobType ? steelseries.KnobType.METAL_KNOB : parameters.knobType),
	            knobStyle = (undefined === parameters.knobStyle ? steelseries.KnobStyle.BLACK : parameters.knobStyle),
	            lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.BLACK : parameters.lcdColor),
	            lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
	            digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
	            foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
	            foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
	            customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
	            //
	            minValue = 0, maxValue = 10, value = minValue,
	            value100 = 0, value1000 = 0, value10000 = 0,
	            angleStep100ft, angleStep1000ft, angleStep10000ft,
	            tickLabelPeriod = 1, // Draw value at every 10th tickmark
	            tween,
	            repainting = false,
	            imageWidth, imageHeight,
	            centerX, centerY,
	            stdFont,
	            mainCtx = getCanvasContext(canvas),  // Get the canvas context
	            // Constants
	            TICKMARK_OFFSET = PI,
	            //
	            initialized = false,
	            // **************   Buffer creation  ********************
	            // Buffer for the frame
	            frameBuffer = createBuffer(size, size),
	            frameContext = frameBuffer.getContext('2d'),
	            // Buffer for the background
	            backgroundBuffer = createBuffer(size, size),
	            backgroundContext = backgroundBuffer.getContext('2d'),
	
	            lcdBuffer,
	
	            // Buffer for 10000ft pointer image painting code
	            pointer10000Buffer = createBuffer(size, size),
	            pointer10000Context = pointer10000Buffer.getContext('2d'),
	
	            // Buffer for 1000ft pointer image painting code
	            pointer1000Buffer = createBuffer(size, size),
	            pointer1000Context = pointer1000Buffer.getContext('2d'),
	
	            // Buffer for 100ft pointer image painting code
	            pointer100Buffer = createBuffer(size, size),
	            pointer100Context = pointer100Buffer.getContext('2d'),
	
	            // Buffer for static foreground painting code
	            foregroundBuffer = createBuffer(size, size),
	            foregroundContext = foregroundBuffer.getContext('2d');
	            // End of variables
	
	        // Get the canvas context and clear it
	        mainCtx.save();
	        // Has a size been specified?
	        size = (size === 0 ? Math.min(mainCtx.canvas.width, mainCtx.canvas.height) : size);
	
	        // Set the size
	        mainCtx.canvas.width = size;
	        mainCtx.canvas.height = size;
	
	        imageWidth = size;
	        imageHeight = size;
	
	        centerX = imageWidth / 2;
	        centerY = imageHeight / 2;
	
	        stdFont = Math.floor(imageWidth * 0.09) + 'px ' + stdFontName;
	
	        // **************   Image creation  ********************
	        var drawLcdText = function (value) {
	            mainCtx.save();
	            mainCtx.textAlign = 'right';
	            mainCtx.textBaseline = 'middle';
	            mainCtx.strokeStyle = lcdColor.textColor;
	            mainCtx.fillStyle = lcdColor.textColor;
	
	            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
	                mainCtx.shadowColor = 'gray';
	                mainCtx.shadowOffsetX = imageWidth * 0.007;
	                mainCtx.shadowOffsetY = imageWidth * 0.007;
	                mainCtx.shadowBlur = imageWidth * 0.009;
	            }
	            if (digitalFont) {
	                mainCtx.font = Math.floor(imageWidth * 0.075) + 'px ' + lcdFontName;
	            } else {
	                mainCtx.font = Math.floor(imageWidth * 0.075) + 'px ' + stdFontName;
	            }
	            mainCtx.fillText(Math.round(value), (imageWidth + (imageWidth * 0.4)) / 2 - 4, imageWidth * 0.607, imageWidth * 0.4);
	            mainCtx.restore();
	        };
	
	        var drawTickmarksImage = function (ctx, freeAreaAngle, offset, minVal, maxVal, angleStep) {
	            var MEDIUM_STROKE = Math.max(imageWidth * 0.012, 2),
	                THIN_STROKE = Math.max(imageWidth * 0.007, 1.5),
	                TEXT_DISTANCE = imageWidth * 0.13,
	                MED_LENGTH = imageWidth * 0.05,
	                MAX_LENGTH = imageWidth * 0.07,
	                RADIUS = imageWidth * 0.4,
	                counter = 0,
	                tickCounter = 0,
	                sinValue = 0,
	                cosValue = 0,
	                alpha,          // angle for tickmarks
	                valueCounter,   // value for tickmarks
	                ALPHA_START = -offset - (freeAreaAngle / 2);
	
	            ctx.save();
	            ctx.textAlign = 'center';
	            ctx.textBaseline = 'middle';
	            ctx.font = stdFont;
	            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	
	            for (alpha = ALPHA_START, valueCounter = 0; valueCounter <= 10; alpha -= angleStep * 0.1, valueCounter += 0.1) {
	                sinValue = Math.sin(alpha);
	                cosValue = Math.cos(alpha);
	
	                // tickmark every 2 units
	                if (counter % 2 === 0) {
	                    ctx.lineWidth = THIN_STROKE;
	                    // Draw ticks
	                    ctx.beginPath();
	                    ctx.moveTo(centerX + (RADIUS - MED_LENGTH) * sinValue, centerY + (RADIUS - MED_LENGTH) * cosValue);
	                    ctx.lineTo(centerX + RADIUS * sinValue, centerY + RADIUS * cosValue);
	                    ctx.closePath();
	                    ctx.stroke();
	                }
	
	                // Different tickmark every 10 units
	                if (counter === 10 || counter === 0) {
	                    ctx.lineWidth = MEDIUM_STROKE;
	
	                    // if gauge is full circle, avoid painting maxValue over minValue
	                    if (freeAreaAngle === 0) {
	                        if (Math.round(valueCounter) !== maxValue) {
	                            ctx.fillText(Math.round(valueCounter).toString(), centerX + (RADIUS - TEXT_DISTANCE) * sinValue, centerY + (RADIUS - TEXT_DISTANCE) * cosValue);
	                        }
	                    }
	                    counter = 0;
	                    tickCounter++;
	
	                    // Draw ticks
	                    ctx.beginPath();
	                    ctx.moveTo(centerX + (RADIUS - MAX_LENGTH) * sinValue, centerY + (RADIUS - MAX_LENGTH) * cosValue);
	                    ctx.lineTo(centerX + RADIUS * sinValue, centerY + RADIUS * cosValue);
	                    ctx.closePath();
	                    ctx.stroke();
	                }
	                counter++;
	            }
	            ctx.restore();
	        };
	
	        var draw100ftPointer = function (ctx, shadow) {
	            var grad;
	
	            if (shadow) {
	                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
	            } else {
	                grad = ctx.createLinearGradient(0, imageHeight * 0.168224, 0, imageHeight * 0.626168);
	                grad.addColorStop(0, '#ffffff');
	                grad.addColorStop(0.31, '#ffffff');
	                grad.addColorStop(0.3101, '#ffffff');
	                grad.addColorStop(0.32, '#202020');
	                grad.addColorStop(1, '#202020');
	                ctx.fillStyle = grad;
	            }
	
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.471962);
	            ctx.bezierCurveTo(imageWidth * 0.514018, imageHeight * 0.471962, imageWidth * 0.509345, imageHeight * 0.467289, imageWidth * 0.509345, imageHeight * 0.467289);
	            ctx.lineTo(imageWidth * 0.509345, imageHeight * 0.200934);
	            ctx.lineTo(imageWidth * 0.5, imageHeight * 0.168224);
	            ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.200934);
	            ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.467289);
	            ctx.bezierCurveTo(imageWidth * 0.490654, imageHeight * 0.467289, imageWidth * 0.481308, imageHeight * 0.471962, imageWidth * 0.481308, imageHeight * 0.471962);
	            ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.481308, imageWidth * 0.467289, imageHeight * 0.490654, imageWidth * 0.467289, imageHeight * 0.5);
	            ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.514018, imageWidth * 0.476635, imageHeight * 0.528037, imageWidth * 0.490654, imageHeight * 0.532710);
	            ctx.bezierCurveTo(imageWidth * 0.490654, imageHeight * 0.532710, imageWidth * 0.490654, imageHeight * 0.579439, imageWidth * 0.490654, imageHeight * 0.588785);
	            ctx.bezierCurveTo(imageWidth * 0.485981, imageHeight * 0.593457, imageWidth * 0.481308, imageHeight * 0.598130, imageWidth * 0.481308, imageHeight * 0.607476);
	            ctx.bezierCurveTo(imageWidth * 0.481308, imageHeight * 0.616822, imageWidth * 0.490654, imageHeight * 0.626168, imageWidth * 0.5, imageHeight * 0.626168);
	            ctx.bezierCurveTo(imageWidth * 0.509345, imageHeight * 0.626168, imageWidth * 0.518691, imageHeight * 0.616822, imageWidth * 0.518691, imageHeight * 0.607476);
	            ctx.bezierCurveTo(imageWidth * 0.518691, imageHeight * 0.598130, imageWidth * 0.514018, imageHeight * 0.593457, imageWidth * 0.504672, imageHeight * 0.588785);
	            ctx.bezierCurveTo(imageWidth * 0.504672, imageHeight * 0.579439, imageWidth * 0.504672, imageHeight * 0.532710, imageWidth * 0.509345, imageHeight * 0.532710);
	            ctx.bezierCurveTo(imageWidth * 0.523364, imageHeight * 0.528037, imageWidth * 0.532710, imageHeight * 0.514018, imageWidth * 0.532710, imageHeight * 0.5);
	            ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.490654, imageWidth * 0.528037, imageHeight * 0.481308, imageWidth * 0.518691, imageHeight * 0.471962);
	            ctx.closePath();
	            ctx.fill();
	            ctx.restore();
	        };
	
	        var draw1000ftPointer = function (ctx) {
	            var grad;
	
	            grad = ctx.createLinearGradient(0, imageHeight * 0.401869, 0, imageHeight * 0.616822);
	            grad.addColorStop(0, '#ffffff');
	            grad.addColorStop(0.51, '#ffffff');
	            grad.addColorStop(0.52, '#ffffff');
	            grad.addColorStop(0.5201, '#202020');
	            grad.addColorStop(0.53, '#202020');
	            grad.addColorStop(1, '#202020');
	            ctx.fillStyle = grad;
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.471962);
	            ctx.bezierCurveTo(imageWidth * 0.514018, imageHeight * 0.462616, imageWidth * 0.528037, imageHeight * 0.401869, imageWidth * 0.528037, imageHeight * 0.401869);
	            ctx.lineTo(imageWidth * 0.5, imageHeight * 0.331775);
	            ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.401869);
	            ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.401869, imageWidth * 0.485981, imageHeight * 0.462616, imageWidth * 0.481308, imageHeight * 0.471962);
	            ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.481308, imageWidth * 0.467289, imageHeight * 0.490654, imageWidth * 0.467289, imageHeight * 0.5);
	            ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.514018, imageWidth * 0.476635, imageHeight * 0.528037, imageWidth * 0.490654, imageHeight * 0.532710);
	            ctx.bezierCurveTo(imageWidth * 0.490654, imageHeight * 0.532710, imageWidth * 0.462616, imageHeight * 0.574766, imageWidth * 0.462616, imageHeight * 0.593457);
	            ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.616822, imageWidth * 0.5, imageHeight * 0.612149, imageWidth * 0.5, imageHeight * 0.612149);
	            ctx.bezierCurveTo(imageWidth * 0.5, imageHeight * 0.612149, imageWidth * 0.532710, imageHeight * 0.616822, imageWidth * 0.537383, imageHeight * 0.593457);
	            ctx.bezierCurveTo(imageWidth * 0.537383, imageHeight * 0.574766, imageWidth * 0.509345, imageHeight * 0.532710, imageWidth * 0.509345, imageHeight * 0.532710);
	            ctx.bezierCurveTo(imageWidth * 0.523364, imageHeight * 0.528037, imageWidth * 0.532710, imageHeight * 0.514018, imageWidth * 0.532710, imageHeight * 0.5);
	            ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.490654, imageWidth * 0.528037, imageHeight * 0.481308, imageWidth * 0.518691, imageHeight * 0.471962);
	            ctx.closePath();
	            ctx.fill();
	            ctx.restore();
	        };
	
	        var draw10000ftPointer = function (ctx) {
	            ctx.fillStyle = '#ffffff';
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.471962);
	            ctx.bezierCurveTo(imageWidth * 0.514018, imageHeight * 0.471962, imageWidth * 0.514018, imageHeight * 0.467289, imageWidth * 0.514018, imageHeight * 0.467289);
	            ctx.lineTo(imageWidth * 0.514018, imageHeight * 0.317757);
	            ctx.lineTo(imageWidth * 0.504672, imageHeight * 0.303738);
	            ctx.lineTo(imageWidth * 0.504672, imageHeight * 0.182242);
	            ctx.lineTo(imageWidth * 0.532710, imageHeight * 0.116822);
	            ctx.lineTo(imageWidth * 0.462616, imageHeight * 0.116822);
	            ctx.lineTo(imageWidth * 0.495327, imageHeight * 0.182242);
	            ctx.lineTo(imageWidth * 0.495327, imageHeight * 0.299065);
	            ctx.lineTo(imageWidth * 0.485981, imageHeight * 0.317757);
	            ctx.lineTo(imageWidth * 0.485981, imageHeight * 0.467289);
	            ctx.bezierCurveTo(imageWidth * 0.485981, imageHeight * 0.467289, imageWidth * 0.485981, imageHeight * 0.471962, imageWidth * 0.481308, imageHeight * 0.471962);
	            ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.481308, imageWidth * 0.467289, imageHeight * 0.490654, imageWidth * 0.467289, imageHeight * 0.5);
	            ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.518691, imageWidth * 0.481308, imageHeight * 0.532710, imageWidth * 0.5, imageHeight * 0.532710);
	            ctx.bezierCurveTo(imageWidth * 0.518691, imageHeight * 0.532710, imageWidth * 0.532710, imageHeight * 0.518691, imageWidth * 0.532710, imageHeight * 0.5);
	            ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.490654, imageWidth * 0.528037, imageHeight * 0.481308, imageWidth * 0.518691, imageHeight * 0.471962);
	            ctx.closePath();
	            ctx.fill();
	        };
	
	        function calcAngleStep() {
	            angleStep100ft = (TWO_PI) / (maxValue - minValue);
	            angleStep1000ft = angleStep100ft / 10;
	            angleStep10000ft = angleStep1000ft / 10;
	        }
	
	        function calcValues() {
	            value100 = (value % 1000) / 100;
	            value1000 = (value % 10000) / 100;
	            value10000 = (value % 100000) / 100;
	        }
	
	        // **************   Initialization  ********************
	        // Draw all static painting code to background
	        var init = function (parameters) {
	            parameters = parameters || {};
	            // Parameters
	            var drawFrame = (undefined === parameters.frame ? false : parameters.frame),
	                drawBackground = (undefined === parameters.background ? false : parameters.background),
	                drawPointers = (undefined === parameters.pointers ? false : parameters.pointers),
	                drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
	
	            initialized = true;
	
	            calcAngleStep();
	
	            // Create frame in frame buffer (backgroundBuffer)
	            if (drawFrame && frameVisible) {
	                drawRadialFrameImage(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
	            }
	
	            if (drawBackground && backgroundVisible) {
	                // Create background in background buffer (backgroundBuffer)
	                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
	
	                // Create custom layer in background buffer (backgroundBuffer)
	                drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
	
	                // Create tickmarks in background buffer (backgroundBuffer)
	                drawTickmarksImage(backgroundContext, 0, TICKMARK_OFFSET, 0, 10, angleStep100ft, tickLabelPeriod, 0, true, true, null);
	            }
	
	            // Create lcd background if selected in background buffer (backgroundBuffer)
	            if (drawBackground && lcdVisible) {
	                lcdBuffer = createLcdBackgroundImage(imageWidth * 0.4, imageHeight * 0.09, lcdColor);
	                backgroundContext.drawImage(lcdBuffer, (imageWidth - (imageWidth * 0.4)) / 2, imageHeight * 0.56);
	            }
	
	            if (drawPointers) {
	                // Create 100ft pointer in buffer
	                draw100ftPointer(pointer100Context, false);
	                // Create 1000ft pointer in buffer
	                draw1000ftPointer(pointer1000Context, false);
	                // Create 10000ft pointer in buffer
	                draw10000ftPointer(pointer10000Context, false);
	            }
	
	            if (drawForeground && foregroundVisible) {
	                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, true, knobType, knobStyle);
	            }
	        };
	
	        var resetBuffers = function (buffers) {
	            buffers = buffers || {};
	            var resetFrame = (undefined === buffers.frame ? false : buffers.frame),
	                resetBackground = (undefined === buffers.background ? false : buffers.background),
	                resetPointers = (undefined === buffers.pointers ? false : buffers.pointers),
	                resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);
	
	            if (resetFrame) {
	                frameBuffer.width = size;
	                frameBuffer.height = size;
	                frameContext = frameBuffer.getContext('2d');
	            }
	
	            if (resetBackground) {
	                backgroundBuffer.width = size;
	                backgroundBuffer.height = size;
	                backgroundContext = backgroundBuffer.getContext('2d');
	            }
	
	            if (resetPointers) {
	                pointer100Buffer.width = size;
	                pointer100Buffer.height = size;
	                pointer100Context = pointer100Buffer.getContext('2d');
	
	                pointer1000Buffer.width = size;
	                pointer1000Buffer.height = size;
	                pointer1000Context = pointer1000Buffer.getContext('2d');
	
	                pointer10000Buffer.width = size;
	                pointer10000Buffer.height = size;
	                pointer10000Context = pointer10000Buffer.getContext('2d');
	            }
	
	            if (resetForeground) {
	                foregroundBuffer.width = size;
	                foregroundBuffer.height = size;
	                foregroundContext = foregroundBuffer.getContext('2d');
	            }
	        };
	
	        //************************************ Public methods **************************************
	        this.setValue = function (newValue) {
	            value = parseFloat(newValue);
	            this.repaint();
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.setValueAnimated = function (newValue, callback) {
	            newValue = parseFloat(newValue);
	            var targetValue = (newValue < minValue ? minValue : newValue),
	                gauge = this,
	                time;
	
	            if (value !== targetValue) {
	                if (undefined !==  tween && tween.isPlaying) {
	                    tween.stop();
	                }
	                // Allow 5 secs per 10,000ft
	                time = Math.max(Math.abs(value - targetValue) / 10000 * 5, 1);
	                tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, time);
	                //tween = new Tween(new Object(), '', Tween.strongEaseInOut, value, targetValue, 1);
	                tween.onMotionChanged = function (event) {
	                        value = event.target._pos;
	                        if (!repainting) {
	                            repainting = true;
	                            requestAnimFrame(gauge.repaint);
	                        }
	                    };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tween.onMotionFinished = callback;
	                }
	
	                tween.start();
	            }
	            return this;
	        };
	
	        this.setFrameDesign = function (newFrameDesign) {
	            resetBuffers({frame: true});
	            frameDesign = newFrameDesign;
	            init({frame: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setBackgroundColor = function (newBackgroundColor) {
	            resetBuffers({background: true,
	                          pointer: true       // type2 & 13 depend on background
	                });
	            backgroundColor = newBackgroundColor;
	            init({background: true,   // type2 & 13 depend on background
	                  pointer: true
	                });
	            this.repaint();
	            return this;
	        };
	
	        this.setForegroundType = function (newForegroundType) {
	            resetBuffers({foreground: true});
	            foregroundType = newForegroundType;
	            init({foreground: true});
	            this.repaint();
	            return this;
	        };
	
	        this.setLcdColor = function (newLcdColor) {
	            lcdColor = newLcdColor;
	            resetBuffers({background: true});
	            init({background: true});
	            this.repaint();
	            return this;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init({frame: true,
	                      background: true,
	                      led: true,
	                      pointers: true,
	                      foreground: true});
	            }
	
	            //mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            // Draw frame
	            if (frameVisible) {
	                mainCtx.drawImage(frameBuffer, 0, 0);
	            }
	
	            // Draw buffered image to visible canvas
	            mainCtx.drawImage(backgroundBuffer, 0, 0);
	
	            // Draw lcd display
	            if (lcdVisible) {
	                drawLcdText(value);
	            }
	
	            // re-calculate the spearate pointer values
	            calcValues();
	
	            var shadowOffset = imageWidth * 0.006 * 0.5;
	
	            mainCtx.save();
	            //Draw 10000ft pointer
	            // Define rotation center
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate((value10000 - minValue) * angleStep10000ft);
	            mainCtx.translate(-centerX, -centerY);
	            // Set the pointer shadow params
	            mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
	            mainCtx.shadowBlur = shadowOffset * 2;
	            // Draw the pointer
	            mainCtx.drawImage(pointer10000Buffer, 0, 0);
	
	            shadowOffset = imageWidth * 0.006 * 0.75;
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
	
	            //Draw 1000ft pointer
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate((value1000 - minValue) * angleStep1000ft - (value10000 - minValue) * angleStep10000ft);
	            mainCtx.translate(-centerX, -centerY);
	            mainCtx.drawImage(pointer1000Buffer, 0, 0);
	
	            shadowOffset = imageWidth * 0.006;
	            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
	
	            //Draw 100ft pointer
	            mainCtx.translate(centerX, centerY);
	            mainCtx.rotate((value100 - minValue) * angleStep100ft - (value1000 - minValue) * angleStep1000ft);
	            mainCtx.translate(-centerX, -centerY);
	            mainCtx.drawImage(pointer100Buffer, 0, 0);
	            mainCtx.restore();
	
	            //Draw the foregound
	            if (foregroundVisible) {
	                mainCtx.drawImage(foregroundBuffer, 0, 0);
	            }
	
	            repainting = false;
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var trafficlight = function (canvas, parameters) {
	        parameters = parameters || {};
	        var width = (undefined === parameters.width ? 0 : parameters.width),
	            height = (undefined === parameters.height ? 0 : parameters.height),
	            //
	            mainCtx = getCanvasContext(canvas),
	            prefHeight, imageWidth, imageHeight,
	            redOn = false,
	            yellowOn = false,
	            greenOn = false,
	            initialized = false,
	            housingBuffer = doc.createElement('canvas'),
	            housingCtx = housingBuffer.getContext('2d'),
	            lightGreenBuffer = doc.createElement('canvas'),
	            lightGreenCtx = lightGreenBuffer.getContext('2d'),
	            greenOnBuffer = doc.createElement('canvas'),
	            greenOnCtx = greenOnBuffer.getContext('2d'),
	            greenOffBuffer = doc.createElement('canvas'),
	            greenOffCtx = greenOffBuffer.getContext('2d'),
	            lightYellowBuffer = doc.createElement('canvas'),
	            lightYellowCtx = lightYellowBuffer.getContext('2d'),
	            yellowOnBuffer = doc.createElement('canvas'),
	            yellowOnCtx = yellowOnBuffer.getContext('2d'),
	            yellowOffBuffer = doc.createElement('canvas'),
	            yellowOffCtx = yellowOffBuffer.getContext('2d'),
	            lightRedBuffer = doc.createElement('canvas'),
	            lightRedCtx = lightRedBuffer.getContext('2d'),
	            redOnBuffer = doc.createElement('canvas'),
	            redOnCtx = redOnBuffer.getContext('2d'),
	            redOffBuffer = doc.createElement('canvas'),
	            redOffCtx = redOffBuffer.getContext('2d');
	            // End of variables
	
	        // Has a size been specified?
	        if (width === 0) {
	            width = mainCtx.canvas.width;
	        }
	        if (height === 0) {
	            height = mainCtx.canvas.height;
	        }
	
	        // Set the size - also clears the canvas
	        mainCtx.canvas.width = width;
	        mainCtx.canvas.height = height;
	
	        prefHeight = width < (height * 0.352517) ? (width * 2.836734) : height;
	        imageWidth = prefHeight * 0.352517;
	        imageHeight = prefHeight;
	
	        housingBuffer.width = imageWidth;
	        housingBuffer.height = imageHeight;
	
	        lightGreenBuffer.width = imageWidth;
	        lightGreenBuffer.height = imageHeight;
	
	        greenOnBuffer.width = imageWidth;
	        greenOnBuffer.height = imageHeight;
	
	        greenOffBuffer.width = imageWidth;
	        greenOffBuffer.height = imageHeight;
	
	        lightYellowBuffer.width = imageWidth;
	        lightYellowBuffer.height = imageHeight;
	
	        yellowOnBuffer.width = imageWidth;
	        yellowOnBuffer.height = imageHeight;
	
	        yellowOffBuffer.width = imageWidth;
	        yellowOffBuffer.height = imageHeight;
	
	        lightRedBuffer.width = imageWidth;
	        lightRedBuffer.height = imageHeight;
	
	        redOnBuffer.width = imageWidth;
	        redOnBuffer.height = imageHeight;
	
	        redOffBuffer.width = imageWidth;
	        redOffBuffer.height = imageHeight;
	
	        var drawHousing = function (ctx) {
	            var housingFill, housingFrontFill;
	
	            ctx.save();
	
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0.107142 * imageWidth, 0);
	            ctx.lineTo(imageWidth - 0.107142 * imageWidth, 0);
	            ctx.quadraticCurveTo(imageWidth, 0, imageWidth, 0.107142 * imageWidth);
	            ctx.lineTo(imageWidth, imageHeight - 0.107142 * imageWidth);
	            ctx.quadraticCurveTo(imageWidth, imageHeight, imageWidth - 0.107142 * imageWidth, imageHeight);
	            ctx.lineTo(0.107142 * imageWidth, imageHeight);
	            ctx.quadraticCurveTo(0, imageHeight, 0, imageHeight - 0.107142 * imageWidth);
	            ctx.lineTo(0, 0.107142 * imageWidth);
	            ctx.quadraticCurveTo(0, 0, 0.107142 * imageWidth, imageHeight);
	            ctx.closePath();
	            housingFill = ctx.createLinearGradient(0.040816 * imageWidth, 0.007194 * imageHeight, 0.952101 * imageWidth, 0.995882 * imageHeight);
	            housingFill.addColorStop(0, 'rgb(152, 152, 154)');
	            housingFill.addColorStop(0.01, 'rgb(152, 152, 154)');
	            housingFill.addColorStop(0.09, '#333333');
	            housingFill.addColorStop(0.24, 'rgb(152, 152, 154)');
	            housingFill.addColorStop(0.55, 'rgb(31, 31, 31)');
	            housingFill.addColorStop(0.78, '#363636');
	            housingFill.addColorStop(0.98, '#000000');
	            housingFill.addColorStop(1, '#000000');
	            ctx.fillStyle = housingFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0.030612 * imageWidth + 0.084183 * imageWidth, 0.010791 * imageHeight);
	            ctx.lineTo(0.030612 * imageWidth + 0.938775 * imageWidth - 0.084183 * imageWidth, 0.010791 * imageHeight);
	            ctx.quadraticCurveTo(0.030612 * imageWidth + 0.938775 * imageWidth, 0.010791 * imageHeight, 0.030612 * imageWidth + 0.938775 * imageWidth, 0.010791 * imageHeight + 0.084183 * imageWidth);
	            ctx.lineTo(0.030612 * imageWidth + 0.938775 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight - 0.084183 * imageWidth);
	            ctx.quadraticCurveTo(0.030612 * imageWidth + 0.938775 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight, 0.030612 * imageWidth + 0.938775 * imageWidth - 0.084183 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight);
	            ctx.lineTo(0.030612 * imageWidth + 0.084183 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight);
	            ctx.quadraticCurveTo(0.030612 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight, 0.030612 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight - 0.084183 * imageWidth);
	            ctx.lineTo(0.030612 * imageWidth, 0.010791 * imageHeight + 0.084183 * imageWidth);
	            ctx.quadraticCurveTo(0.030612 * imageWidth, 0.010791 * imageHeight, 0.030612 * imageWidth + 0.084183 * imageWidth, 0.010791 * imageHeight);
	            ctx.closePath();
	            housingFrontFill = ctx.createLinearGradient(-0.132653 * imageWidth, -0.053956 * imageHeight, 2.061408 * imageWidth, 0.667293 * imageHeight);
	            housingFrontFill.addColorStop(0, '#000000');
	            housingFrontFill.addColorStop(0.01, '#000000');
	            housingFrontFill.addColorStop(0.16, '#373735');
	            housingFrontFill.addColorStop(0.31, '#000000');
	            housingFrontFill.addColorStop(0.44, '#303030');
	            housingFrontFill.addColorStop(0.65, '#000000');
	            housingFrontFill.addColorStop(0.87, '#363636');
	            housingFrontFill.addColorStop(0.98, '#000000');
	            housingFrontFill.addColorStop(1, '#000000');
	            ctx.fillStyle = housingFrontFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.restore();
	        };
	
	        var drawLightGreen = function (ctx) {
	            var lightGreenFrameFill, lightGreenInnerFill, lightGreenEffectFill, lightGreenInnerShadowFill;
	
	            ctx.save();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.805755 * imageHeight, 0.397959 * imageWidth, 0, TWO_PI, false);
	            lightGreenFrameFill = ctx.createLinearGradient(0, 0.665467 * imageHeight, 0, 0.946043 * imageHeight);
	            lightGreenFrameFill.addColorStop(0, '#ffffff');
	            lightGreenFrameFill.addColorStop(0.05, 'rgb(204, 204, 204)');
	            lightGreenFrameFill.addColorStop(0.1, 'rgb(153, 153, 153)');
	            lightGreenFrameFill.addColorStop(0.17, '#666666');
	            lightGreenFrameFill.addColorStop(0.27, '#333333');
	            lightGreenFrameFill.addColorStop(1, '#010101');
	            ctx.fillStyle = lightGreenFrameFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.scale(1.083333, 1);
	            ctx.beginPath();
	            ctx.arc(0.461538 * imageWidth, 0.816546 * imageHeight, 0.367346 * imageWidth, 0, TWO_PI, false);
	            lightGreenInnerFill = ctx.createLinearGradient(0, 0.687050 * imageHeight, 0, 0.946043 * imageHeight);
	            lightGreenInnerFill.addColorStop(0, '#000000');
	            lightGreenInnerFill.addColorStop(0.35, '#040404');
	            lightGreenInnerFill.addColorStop(0.66, '#000000');
	            lightGreenInnerFill.addColorStop(1, '#010101');
	            ctx.fillStyle = lightGreenInnerFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
	            lightGreenEffectFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.362244 * imageWidth);
	            lightGreenEffectFill.addColorStop(0, '#000000');
	            lightGreenEffectFill.addColorStop(0.88, '#000000');
	            lightGreenEffectFill.addColorStop(0.95, 'rgb(94, 94, 94)');
	            lightGreenEffectFill.addColorStop(1, '#010101');
	            ctx.fillStyle = lightGreenEffectFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
	            lightGreenInnerShadowFill = ctx.createLinearGradient(0, 0.687050 * imageHeight, 0, 0.917266 * imageHeight);
	            lightGreenInnerShadowFill.addColorStop(0, '#000000');
	            lightGreenInnerShadowFill.addColorStop(1, 'rgba(1, 1, 1, 0)');
	            ctx.fillStyle = lightGreenInnerShadowFill;
	            ctx.fill();
	            ctx.restore();
	            ctx.restore();
	        };
	
	        var drawGreenOn = function (ctx) {
	            var greenOnFill, greenOnGlowFill;
	
	            ctx.save();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
	            greenOnFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth);
	            greenOnFill.addColorStop(0, 'rgb(85, 185, 123)');
	            greenOnFill.addColorStop(1, 'rgb(0, 31, 0)');
	            ctx.fillStyle = greenOnFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0, 0.812949 * imageHeight);
	            ctx.bezierCurveTo(0, 0.910071 * imageHeight, 0.224489 * imageWidth, 0.989208 * imageHeight, 0.5 * imageWidth, 0.989208 * imageHeight);
	            ctx.bezierCurveTo(0.775510 * imageWidth, 0.989208 * imageHeight, imageWidth, 0.910071 * imageHeight, imageWidth, 0.809352 * imageHeight);
	            ctx.bezierCurveTo(0.908163 * imageWidth, 0.751798 * imageHeight, 0.704081 * imageWidth, 0.687050 * imageHeight, 0.5 * imageWidth, 0.687050 * imageHeight);
	            ctx.bezierCurveTo(0.285714 * imageWidth, 0.687050 * imageHeight, 0.081632 * imageWidth, 0.751798 * imageHeight, 0, 0.812949 * imageHeight);
	            ctx.closePath();
	            greenOnGlowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.515306 * imageWidth);
	            greenOnGlowFill.addColorStop(0, 'rgb(65, 187, 126)');
	            greenOnGlowFill.addColorStop(1, 'rgba(4, 37, 8, 0)');
	            ctx.fillStyle = greenOnGlowFill;
	            ctx.fill();
	            ctx.restore();
	            ctx.restore();
	        };
	
	        var drawGreenOff = function (ctx) {
	            var greenOffFill, greenOffInnerShadowFill;
	
	            ctx.save();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
	            greenOffFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth);
	            greenOffFill.addColorStop(0, 'rgba(0, 255, 0, 0.25)');
	            greenOffFill.addColorStop(1, 'rgba(0, 255, 0, 0.05)');
	            ctx.fillStyle = greenOffFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
	            greenOffInnerShadowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth);
	            greenOffInnerShadowFill.addColorStop(0, 'rgba(1, 1, 1, 0)');
	            greenOffInnerShadowFill.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
	            greenOffInnerShadowFill.addColorStop(0.5501, 'rgba(0, 0, 0, 0)');
	            greenOffInnerShadowFill.addColorStop(0.78, 'rgba(0, 0, 0, 0.12)');
	            greenOffInnerShadowFill.addColorStop(0.79, 'rgba(0, 0, 0, 0.12)');
	            greenOffInnerShadowFill.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
	            ctx.fillStyle = greenOffInnerShadowFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.fillStyle = ctx.createPattern(hatchBuffer, 'repeat');
	            ctx.fill();
	
	            ctx.restore();
	        };
	
	        var drawLightYellow = function (ctx) {
	            var lightYellowFrameFill, lightYellowInnerFill, lightYellowEffectFill, lightYellowInnerShadowFill;
	
	            ctx.save();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.496402 * imageHeight, 0.397959 * imageWidth, 0, TWO_PI, false);
	            lightYellowFrameFill = ctx.createLinearGradient(0, 0.356115 * imageHeight, 0, 0.636690 * imageHeight);
	            lightYellowFrameFill.addColorStop(0, '#ffffff');
	            lightYellowFrameFill.addColorStop(0.05, 'rgb(204, 204, 204)');
	            lightYellowFrameFill.addColorStop(0.1, 'rgb(153, 153, 153)');
	            lightYellowFrameFill.addColorStop(0.17, '#666666');
	            lightYellowFrameFill.addColorStop(0.27, '#333333');
	            lightYellowFrameFill.addColorStop(1, '#010101');
	            ctx.fillStyle = lightYellowFrameFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.scale(1.083333, 1);
	            ctx.beginPath();
	            ctx.arc(0.461538 * imageWidth, 0.507194 * imageHeight, 0.367346 * imageWidth, 0, TWO_PI, false);
	            lightYellowInnerFill = ctx.createLinearGradient(0, 0.377697 * imageHeight, 0, 0.636690 * imageHeight);
	            lightYellowInnerFill.addColorStop(0, '#000000');
	            lightYellowInnerFill.addColorStop(0.35, '#040404');
	            lightYellowInnerFill.addColorStop(0.66, '#000000');
	            lightYellowInnerFill.addColorStop(1, '#010101');
	            ctx.fillStyle = lightYellowInnerFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
	            lightYellowEffectFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.362244 * imageWidth);
	            lightYellowEffectFill.addColorStop(0, '#000000');
	            lightYellowEffectFill.addColorStop(0.88, '#000000');
	            lightYellowEffectFill.addColorStop(0.95, '#5e5e5e');
	            lightYellowEffectFill.addColorStop(1, '#010101');
	            ctx.fillStyle = lightYellowEffectFill;
	            ctx.fill();
	            ctx.restore();
	
	            //lIGHT_YELLOW_4_E_INNER_SHADOW_3_4
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
	            lightYellowInnerShadowFill = ctx.createLinearGradient(0, 0.377697 * imageHeight, 0, 0.607913 * imageHeight);
	            lightYellowInnerShadowFill.addColorStop(0, '#000000');
	            lightYellowInnerShadowFill.addColorStop(1, 'rgba(1, 1, 1, 0)');
	            ctx.fillStyle = lightYellowInnerShadowFill;
	            ctx.fill();
	            ctx.restore();
	            ctx.restore();
	        };
	
	        var drawYellowOn = function (ctx) {
	            var yellowOnFill, yellowOnGlowFill;
	
	            ctx.save();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
	            yellowOnFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth);
	            yellowOnFill.addColorStop(0, '#fed434');
	            yellowOnFill.addColorStop(1, '#82330c');
	            ctx.fillStyle = yellowOnFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0, 0.503597 * imageHeight);
	            ctx.bezierCurveTo(0, 0.600719 * imageHeight, 0.224489 * imageWidth, 0.679856 * imageHeight, 0.5 * imageWidth, 0.679856 * imageHeight);
	            ctx.bezierCurveTo(0.775510 * imageWidth, 0.679856 * imageHeight, imageWidth, 0.600719 * imageHeight, imageWidth, 0.5 * imageHeight);
	            ctx.bezierCurveTo(0.908163 * imageWidth, 0.442446 * imageHeight, 0.704081 * imageWidth, 0.377697 * imageHeight, 0.5 * imageWidth, 0.377697 * imageHeight);
	            ctx.bezierCurveTo(0.285714 * imageWidth, 0.377697 * imageHeight, 0.081632 * imageWidth, 0.442446 * imageHeight, 0, 0.503597 * imageHeight);
	            ctx.closePath();
	            yellowOnGlowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.515306 * imageWidth);
	            yellowOnGlowFill.addColorStop(0, '#fed434');
	            yellowOnGlowFill.addColorStop(1, 'rgba(130, 51, 12, 0)');
	            ctx.fillStyle = yellowOnGlowFill;
	            ctx.fill();
	            ctx.restore();
	            ctx.restore();
	        };
	
	        var drawYellowOff = function (ctx) {
	            var yellowOffFill, yellowOffInnerShadowFill;
	
	            ctx.save();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
	            yellowOffFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth);
	            yellowOffFill.addColorStop(0, 'rgba(255, 255, 0, 0.25)');
	            yellowOffFill.addColorStop(1, 'rgba(255, 255, 0, 0.05)');
	            ctx.fillStyle = yellowOffFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
	            yellowOffInnerShadowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth);
	            yellowOffInnerShadowFill.addColorStop(0, 'rgba(1, 1, 1, 0)');
	            yellowOffInnerShadowFill.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
	            yellowOffInnerShadowFill.addColorStop(0.5501, 'rgba(0, 0, 0, 0)');
	            yellowOffInnerShadowFill.addColorStop(0.78, 'rgba(0, 0, 0, 0.12)');
	            yellowOffInnerShadowFill.addColorStop(0.79, 'rgba(0, 0, 0, 0.13)');
	            yellowOffInnerShadowFill.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
	            ctx.fillStyle = yellowOffInnerShadowFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.fillStyle = ctx.createPattern(hatchBuffer, 'repeat');
	            ctx.fill();
	
	            ctx.restore();
	        };
	
	        var drawLightRed = function (ctx) {
	            var lightRedFrameFill, lightRedInnerFill, lightRedEffectFill, lightRedInnerShadowFill;
	
	            ctx.save();
	
	            //lIGHT_RED_7_E_FRAME_0_1
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.187050 * imageHeight, 0.397959 * imageWidth, 0, TWO_PI, false);
	            lightRedFrameFill = ctx.createLinearGradient((0.5 * imageWidth), (0.046762 * imageHeight), ((0.500000) * imageWidth), ((0.327338) * imageHeight));
	            lightRedFrameFill.addColorStop(0, '#ffffff');
	            lightRedFrameFill.addColorStop(0.05, '#cccccc');
	            lightRedFrameFill.addColorStop(0.1, '#999999');
	            lightRedFrameFill.addColorStop(0.17, '#666666');
	            lightRedFrameFill.addColorStop(0.27, '#333333');
	            lightRedFrameFill.addColorStop(1, '#010101');
	            ctx.fillStyle = lightRedFrameFill;
	            ctx.fill();
	            ctx.restore();
	
	            //lIGHT_RED_7_E_INNER_CLIP_1_2
	            ctx.save();
	            ctx.scale(1.083333, 1);
	            ctx.beginPath();
	            ctx.arc(0.461538 * imageWidth, 0.197841 * imageHeight, 0.367346 * imageWidth, 0, TWO_PI, false);
	            lightRedInnerFill = ctx.createLinearGradient((0.5 * imageWidth), (0.068345 * imageHeight), ((0.500000) * imageWidth), ((0.327338) * imageHeight));
	            lightRedInnerFill.addColorStop(0, '#000000');
	            lightRedInnerFill.addColorStop(0.35, '#040404');
	            lightRedInnerFill.addColorStop(0.66, '#000000');
	            lightRedInnerFill.addColorStop(1, '#010101');
	            ctx.fillStyle = lightRedInnerFill;
	            ctx.fill();
	            ctx.restore();
	
	            //lIGHT_RED_7_E_LIGHT_EFFECT_2_3
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
	            lightRedEffectFill = ctx.createRadialGradient((0.5) * imageWidth, ((0.190647) * imageHeight), 0, ((0.5) * imageWidth), ((0.190647) * imageHeight), 0.362244 * imageWidth);
	            lightRedEffectFill.addColorStop(0, '#000000');
	            lightRedEffectFill.addColorStop(0.88, '#000000');
	            lightRedEffectFill.addColorStop(0.95, '#5e5e5e');
	            lightRedEffectFill.addColorStop(1, '#010101');
	            ctx.fillStyle = lightRedEffectFill;
	            ctx.fill();
	            ctx.restore();
	
	            //lIGHT_RED_7_E_INNER_SHADOW_3_4
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
	            lightRedInnerShadowFill = ctx.createLinearGradient((0.5 * imageWidth), (0.068345 * imageHeight), ((0.500000) * imageWidth), ((0.298561) * imageHeight));
	            lightRedInnerShadowFill.addColorStop(0, '#000000');
	            lightRedInnerShadowFill.addColorStop(1, 'rgba(1, 1, 1, 0)');
	            ctx.fillStyle = lightRedInnerShadowFill;
	            ctx.fill();
	            ctx.restore();
	            ctx.restore();
	        };
	
	        var drawRedOn = function (ctx) {
	            var redOnFill, redOnGlowFill;
	
	            ctx.save();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
	            redOnFill = ctx.createRadialGradient(0.5 * imageWidth, 0.190647 * imageHeight, 0, 0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth);
	            redOnFill.addColorStop(0, '#ff0000');
	            redOnFill.addColorStop(1, '#410004');
	            ctx.fillStyle = redOnFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0, 0.194244 * imageHeight);
	            ctx.bezierCurveTo(0, 0.291366 * imageHeight, 0.224489 * imageWidth, 0.370503 * imageHeight, 0.5 * imageWidth, 0.370503 * imageHeight);
	            ctx.bezierCurveTo(0.775510 * imageWidth, 0.370503 * imageHeight, imageWidth, 0.291366 * imageHeight, imageWidth, 0.190647 * imageHeight);
	            ctx.bezierCurveTo(0.908163 * imageWidth, 0.133093 * imageHeight, 0.704081 * imageWidth, 0.068345 * imageHeight, 0.5 * imageWidth, 0.068345 * imageHeight);
	            ctx.bezierCurveTo(0.285714 * imageWidth, 0.068345 * imageHeight, 0.081632 * imageWidth, 0.133093 * imageHeight, 0, 0.194244 * imageHeight);
	            ctx.closePath();
	            redOnGlowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.190647 * imageHeight, 0, 0.5 * imageWidth, 0.190647 * imageHeight, 0.515306 * imageWidth);
	            redOnGlowFill.addColorStop(0, '#ff0000');
	            redOnGlowFill.addColorStop(1, 'rgba(118, 5, 1, 0)');
	            ctx.fillStyle = redOnGlowFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.restore();
	        };
	
	        var drawRedOff = function (ctx) {
	            var redOffFill, redOffInnerShadowFill;
	
	            ctx.save();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
	            redOffFill = ctx.createRadialGradient(0.5 * imageWidth, 0.190647 * imageHeight, 0, 0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth);
	            redOffFill.addColorStop(0, 'rgba(255, 0, 0, 0.25)');
	            redOffFill.addColorStop(1, 'rgba(255, 0, 0, 0.05)');
	            ctx.fillStyle = redOffFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.save();
	            ctx.scale(1, 1);
	            ctx.beginPath();
	            ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
	            redOffInnerShadowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.190647 * imageHeight, 0, 0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth);
	            redOffInnerShadowFill.addColorStop(0, 'rgba(1, 1, 1, 0)');
	            redOffInnerShadowFill.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
	            redOffInnerShadowFill.addColorStop(0.5501, 'rgba(0, 0, 0, 0)');
	            redOffInnerShadowFill.addColorStop(0.78, 'rgba(0, 0, 0, 0.12)');
	            redOffInnerShadowFill.addColorStop(0.79, 'rgba(0, 0, 0, 0.13)');
	            redOffInnerShadowFill.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
	            ctx.fillStyle = redOffInnerShadowFill;
	            ctx.fill();
	            ctx.restore();
	
	            ctx.fillStyle = ctx.createPattern(hatchBuffer, 'repeat');
	            ctx.fill();
	
	            ctx.restore();
	        };
	
	        function drawToBuffer(width, height, drawFunction) {
	            var buffer = doc.createElement('canvas');
	            buffer.width = width;
	            buffer.height = height;
	            drawFunction(buffer.getContext('2d'));
	            return buffer;
	        }
	
	        var hatchBuffer = drawToBuffer(2, 2, function (ctx) {
	            ctx.save();
	            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
	            ctx.beginPath();
	            ctx.lineTo(0, 0, 1, 0);
	            ctx.lineTo(0, 1, 0, 1);
	            ctx.stroke();
	            ctx.restore();
	        });
	
	        var init = function () {
	            initialized = true;
	
	            drawHousing(housingCtx);
	            drawLightGreen(lightGreenCtx);
	            drawGreenOn(greenOnCtx);
	            drawGreenOff(greenOffCtx);
	            drawLightYellow(lightYellowCtx);
	            drawYellowOn(yellowOnCtx);
	            drawYellowOff(yellowOffCtx);
	            drawLightRed(lightRedCtx);
	            drawRedOn(redOnCtx);
	            drawRedOff(redOffCtx);
	        };
	
	        // **************   P U B L I C   M E T H O D S   ********************************
	        this.setRedOn = function (on) {
	            redOn = !!on;
	            this.repaint();
	        };
	
	        this.isRedOn = function () {
	            return redOn;
	        };
	
	        this.setYellowOn = function (on) {
	            yellowOn = !!on;
	            this.repaint();
	        };
	
	        this.isYellowOn = function () {
	            return yellowOn;
	        };
	
	        this.setGreenOn = function (on) {
	            greenOn = !!on;
	            this.repaint();
	        };
	
	        this.isGreenOn = function () {
	            return greenOn;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init();
	            }
	
	            mainCtx.save();
	            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
	
	            // housing
	            mainCtx.drawImage(housingBuffer, 0, 0);
	
	            // Green light
	            mainCtx.drawImage(lightGreenBuffer, 0, 0);
	
	            if (greenOn) {
	                mainCtx.drawImage(greenOnBuffer, 0, 0);
	            }
	
	            mainCtx.drawImage(greenOffBuffer, 0, 0);
	
	            // Yellow light
	            mainCtx.drawImage(lightYellowBuffer, 0, 0);
	
	            if (yellowOn) {
	                mainCtx.drawImage(yellowOnBuffer, 0, 0);
	            }
	
	            mainCtx.drawImage(yellowOffBuffer, 0, 0);
	
	            // Red light
	            mainCtx.drawImage(lightRedBuffer, 0, 0);
	
	            if (redOn) {
	                mainCtx.drawImage(redOnBuffer, 0, 0);
	            }
	
	            mainCtx.drawImage(redOffBuffer, 0, 0);
	            mainCtx.restore();
	        };
	
	        // Visualize the component
	        this.repaint();
	
	        return this;
	    };
	
	    var lightbulb = function (canvas, parameters) {
	        parameters = parameters || {};
	        var mainCtx,
	            // parameters
	            width = (undefined === parameters.width ? 0 : parameters.width),
	            height = (undefined === parameters.height ? 0 : parameters.height),
	            glowColor = (undefined === parameters.glowColor ? '#ffff00' : parameters.glowColor),
	            //
	            size, imageWidth, imageHeight,
	            initialized = false,
	            lightOn = false,
	            alpha = 1,
	            offBuffer = doc.createElement('canvas'),
	            offCtx = offBuffer.getContext('2d'),
	            onBuffer = doc.createElement('canvas'),
	            onCtx = onBuffer.getContext('2d'),
	            bulbBuffer = doc.createElement('canvas'),
	            bulbCtx = bulbBuffer.getContext('2d');
	            // End of variables
	
	        // Get the canvas context and clear it
	        mainCtx = document.getElementById(canvas).getContext('2d');
	
	        // Has a size been specified?
	        if (width === 0) {
	            width = mainCtx.canvas.width;
	        }
	        if (height === 0) {
	            height = mainCtx.canvas.height;
	        }
	
	        // Get the size
	        mainCtx.canvas.width = width;
	        mainCtx.canvas.height = height;
	        size = width < height ? width : height;
	        imageWidth = size;
	        imageHeight = size;
	
	        function drawToBuffer(width, height, drawFunction) {
	            var buffer = doc.createElement('canvas');
	            buffer.width = width;
	            buffer.height = height;
	            drawFunction(buffer.getContext('2d'));
	            return buffer;
	        }
	
	        var getColorValues = function (color) {
	            var colorData,
	                lookupBuffer = drawToBuffer(1, 1, function (ctx) {
	                    ctx.fillStyle = color;
	                    ctx.beginPath();
	                    ctx.rect(0, 0, 1, 1);
	                    ctx.fill();
	                });
	
	            colorData = lookupBuffer.getContext('2d').getImageData(0, 0, 2, 2).data;
	            return [colorData[0], colorData[1], colorData[2]];
	        };
	
	        offBuffer.width = imageWidth;
	        offBuffer.height = imageHeight;
	
	        onBuffer.width = imageWidth;
	        onBuffer.height = imageHeight;
	
	        bulbBuffer.width = imageWidth;
	        bulbBuffer.height = imageHeight;
	
	        var drawOff = function (ctx) {
	            var glassOffFill;
	
	            ctx.save();
	
	            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0.289473 * imageWidth, 0.438596 * imageHeight);
	            ctx.bezierCurveTo(0.289473 * imageWidth, 0.561403 * imageHeight, 0.385964 * imageWidth, 0.605263 * imageHeight, 0.385964 * imageWidth, 0.745614 * imageHeight);
	            ctx.bezierCurveTo(0.385964 * imageWidth, 0.745614 * imageHeight, 0.587719 * imageWidth, 0.745614 * imageHeight, 0.587719 * imageWidth, 0.745614 * imageHeight);
	            ctx.bezierCurveTo(0.587719 * imageWidth, 0.605263 * imageHeight, 0.692982 * imageWidth, 0.561403 * imageHeight, 0.692982 * imageWidth, 0.438596 * imageHeight);
	            ctx.bezierCurveTo(0.692982 * imageWidth, 0.324561 * imageHeight, 0.605263 * imageWidth, 0.228070 * imageHeight, 0.5 * imageWidth, 0.228070 * imageHeight);
	            ctx.bezierCurveTo(0.385964 * imageWidth, 0.228070 * imageHeight, 0.289473 * imageWidth, 0.324561 * imageHeight, 0.289473 * imageWidth, 0.438596 * imageHeight);
	            ctx.closePath();
	            glassOffFill = ctx.createLinearGradient(0, 0.289473 * imageHeight, 0, 0.701754 * imageHeight);
	            glassOffFill.addColorStop(0, '#eeeeee');
	            glassOffFill.addColorStop(0.99, '#999999');
	            glassOffFill.addColorStop(1, '#999999');
	            ctx.fillStyle = glassOffFill;
	            ctx.fill();
	            ctx.lineCap = 'butt';
	            ctx.lineJoin = 'round';
	            ctx.lineWidth = 0.008771 * imageWidth;
	            ctx.strokeStyle = '#cccccc';
	            ctx.stroke();
	            ctx.restore();
	            ctx.restore();
	        };
	
	        var drawOn = function (ctx) {
	            var glassOnFill,
	                data = getColorValues(glowColor),
	                red = data[0],
	                green = data[1],
	                blue = data[2],
	                hsl = rgbToHsl(red, green, blue);
	
	            ctx.save();
	            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0.289473 * imageWidth, 0.438596 * imageHeight);
	            ctx.bezierCurveTo(0.289473 * imageWidth, 0.561403 * imageHeight, 0.385964 * imageWidth, 0.605263 * imageHeight, 0.385964 * imageWidth, 0.745614 * imageHeight);
	            ctx.bezierCurveTo(0.385964 * imageWidth, 0.745614 * imageHeight, 0.587719 * imageWidth, 0.745614 * imageHeight, 0.587719 * imageWidth, 0.745614 * imageHeight);
	            ctx.bezierCurveTo(0.587719 * imageWidth, 0.605263 * imageHeight, 0.692982 * imageWidth, 0.561403 * imageHeight, 0.692982 * imageWidth, 0.438596 * imageHeight);
	            ctx.bezierCurveTo(0.692982 * imageWidth, 0.324561 * imageHeight, 0.605263 * imageWidth, 0.228070 * imageHeight, 0.5 * imageWidth, 0.228070 * imageHeight);
	            ctx.bezierCurveTo(0.385964 * imageWidth, 0.228070 * imageHeight, 0.289473 * imageWidth, 0.324561 * imageHeight, 0.289473 * imageWidth, 0.438596 * imageHeight);
	            ctx.closePath();
	
	            glassOnFill = ctx.createLinearGradient(0, 0.289473 * imageHeight, 0, 0.701754 * imageHeight);
	
	            if (red === green && green === blue) {
	                glassOnFill.addColorStop(0, 'hsl(0, 60%, 0%)');
	                glassOnFill.addColorStop(1, 'hsl(0, 40%, 0%)');
	            } else {
	                glassOnFill.addColorStop(0, 'hsl(' + hsl[0] * 255 + ', ' + hsl[1] * 100 + '%, 70%)');
	                glassOnFill.addColorStop(1, 'hsl(' + hsl[0] * 255 + ', ' + hsl[1] * 100 + '%, 80%)');
	            }
	            ctx.fillStyle = glassOnFill;
	
	            // sets shadow properties
	            ctx.shadowOffsetX = 0;
	            ctx.shadowOffsetY = 0;
	            ctx.shadowBlur = 30;
	            ctx.shadowColor = glowColor;
	
	            ctx.fill();
	
	            ctx.lineCap = 'butt';
	            ctx.lineJoin = 'round';
	            ctx.lineWidth = 0.008771 * imageWidth;
	            ctx.strokeStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', 0.4)';
	            ctx.stroke();
	
	            ctx.restore();
	
	            ctx.restore();
	        };
	
	        var drawBulb = function (ctx) {
	            var highlight, winding, winding1, contactPlate;
	
	            ctx.save();
	
	            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0.350877 * imageWidth, 0.333333 * imageHeight);
	            ctx.bezierCurveTo(0.350877 * imageWidth, 0.280701 * imageHeight, 0.412280 * imageWidth, 0.236842 * imageHeight, 0.5 * imageWidth, 0.236842 * imageHeight);
	            ctx.bezierCurveTo(0.578947 * imageWidth, 0.236842 * imageHeight, 0.640350 * imageWidth, 0.280701 * imageHeight, 0.640350 * imageWidth, 0.333333 * imageHeight);
	            ctx.bezierCurveTo(0.640350 * imageWidth, 0.385964 * imageHeight, 0.578947 * imageWidth, 0.429824 * imageHeight, 0.5 * imageWidth, 0.429824 * imageHeight);
	            ctx.bezierCurveTo(0.412280 * imageWidth, 0.429824 * imageHeight, 0.350877 * imageWidth, 0.385964 * imageHeight, 0.350877 * imageWidth, 0.333333 * imageHeight);
	            ctx.closePath();
	            highlight = ctx.createLinearGradient(0, 0.245614 * imageHeight, 0, 0.429824 * imageHeight);
	            highlight.addColorStop(0, '#ffffff');
	            highlight.addColorStop(0.99, 'rgba(255, 255, 255, 0)');
	            highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
	            ctx.fillStyle = highlight;
	            ctx.fill();
	            ctx.restore();
	
	            //winding
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0.377192 * imageWidth, 0.745614 * imageHeight);
	            ctx.bezierCurveTo(0.377192 * imageWidth, 0.745614 * imageHeight, 0.429824 * imageWidth, 0.728070 * imageHeight, 0.491228 * imageWidth, 0.728070 * imageHeight);
	            ctx.bezierCurveTo(0.561403 * imageWidth, 0.728070 * imageHeight, 0.605263 * imageWidth, 0.736842 * imageHeight, 0.605263 * imageWidth, 0.736842 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.763157 * imageHeight);
	            ctx.lineTo(0.596491 * imageWidth, 0.780701 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.798245 * imageHeight);
	            ctx.lineTo(0.596491 * imageWidth, 0.815789 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.833333 * imageHeight);
	            ctx.lineTo(0.596491 * imageWidth, 0.850877 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.868421 * imageHeight);
	            ctx.lineTo(0.596491 * imageWidth, 0.885964 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.894736 * imageHeight);
	            ctx.bezierCurveTo(0.605263 * imageWidth, 0.894736 * imageHeight, 0.570175 * imageWidth, 0.956140 * imageHeight, 0.535087 * imageWidth, 0.991228 * imageHeight);
	            ctx.bezierCurveTo(0.526315 * imageWidth, 0.991228 * imageHeight, 0.517543 * imageWidth, imageHeight, 0.5 * imageWidth, imageHeight);
	            ctx.bezierCurveTo(0.482456 * imageWidth, imageHeight, 0.473684 * imageWidth, imageHeight, 0.464912 * imageWidth, 0.991228 * imageHeight);
	            ctx.bezierCurveTo(0.421052 * imageWidth, 0.947368 * imageHeight, 0.394736 * imageWidth, 0.903508 * imageHeight, 0.394736 * imageWidth, 0.903508 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.894736 * imageHeight);
	            ctx.lineTo(0.385964 * imageWidth, 0.885964 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.868421 * imageHeight);
	            ctx.lineTo(0.385964 * imageWidth, 0.850877 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.833333 * imageHeight);
	            ctx.lineTo(0.385964 * imageWidth, 0.815789 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.798245 * imageHeight);
	            ctx.lineTo(0.377192 * imageWidth, 0.789473 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.771929 * imageHeight);
	            ctx.lineTo(0.377192 * imageWidth, 0.763157 * imageHeight);
	            ctx.lineTo(0.377192 * imageWidth, 0.745614 * imageHeight);
	            ctx.closePath();
	            winding = ctx.createLinearGradient(0.473684 * imageWidth, 0.728070 * imageHeight, 0.484702 * imageWidth, 0.938307 * imageHeight);
	            winding.addColorStop(0, '#333333');
	            winding.addColorStop(0.04, '#d9dad6');
	            winding.addColorStop(0.19, '#e4e5e0');
	            winding.addColorStop(0.24, '#979996');
	            winding.addColorStop(0.31, '#fbffff');
	            winding.addColorStop(0.4, '#818584');
	            winding.addColorStop(0.48, '#f5f7f4');
	            winding.addColorStop(0.56, '#959794');
	            winding.addColorStop(0.64, '#f2f2f0');
	            winding.addColorStop(0.7, '#828783');
	            winding.addColorStop(0.78, '#fcfcfc');
	            winding.addColorStop(1, '#666666');
	            ctx.fillStyle = winding;
	            ctx.fill();
	            ctx.restore();
	
	            // winding
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0.377192 * imageWidth, 0.745614 * imageHeight);
	            ctx.bezierCurveTo(0.377192 * imageWidth, 0.745614 * imageHeight, 0.429824 * imageWidth, 0.728070 * imageHeight, 0.491228 * imageWidth, 0.728070 * imageHeight);
	            ctx.bezierCurveTo(0.561403 * imageWidth, 0.728070 * imageHeight, 0.605263 * imageWidth, 0.736842 * imageHeight, 0.605263 * imageWidth, 0.736842 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.763157 * imageHeight);
	            ctx.lineTo(0.596491 * imageWidth, 0.780701 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.798245 * imageHeight);
	            ctx.lineTo(0.596491 * imageWidth, 0.815789 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.833333 * imageHeight);
	            ctx.lineTo(0.596491 * imageWidth, 0.850877 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.868421 * imageHeight);
	            ctx.lineTo(0.596491 * imageWidth, 0.885964 * imageHeight);
	            ctx.lineTo(0.605263 * imageWidth, 0.894736 * imageHeight);
	            ctx.bezierCurveTo(0.605263 * imageWidth, 0.894736 * imageHeight, 0.570175 * imageWidth, 0.956140 * imageHeight, 0.535087 * imageWidth, 0.991228 * imageHeight);
	            ctx.bezierCurveTo(0.526315 * imageWidth, 0.991228 * imageHeight, 0.517543 * imageWidth, imageHeight, 0.5 * imageWidth, imageHeight);
	            ctx.bezierCurveTo(0.482456 * imageWidth, imageHeight, 0.473684 * imageWidth, imageHeight, 0.464912 * imageWidth, 0.991228 * imageHeight);
	            ctx.bezierCurveTo(0.421052 * imageWidth, 0.947368 * imageHeight, 0.394736 * imageWidth, 0.903508 * imageHeight, 0.394736 * imageWidth, 0.903508 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.894736 * imageHeight);
	            ctx.lineTo(0.385964 * imageWidth, 0.885964 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.868421 * imageHeight);
	            ctx.lineTo(0.385964 * imageWidth, 0.850877 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.833333 * imageHeight);
	            ctx.lineTo(0.385964 * imageWidth, 0.815789 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.798245 * imageHeight);
	            ctx.lineTo(0.377192 * imageWidth, 0.789473 * imageHeight);
	            ctx.lineTo(0.394736 * imageWidth, 0.771929 * imageHeight);
	            ctx.lineTo(0.377192 * imageWidth, 0.763157 * imageHeight);
	            ctx.lineTo(0.377192 * imageWidth, 0.745614 * imageHeight);
	            ctx.closePath();
	            winding1 = ctx.createLinearGradient(0.377192 * imageWidth, 0.789473 * imageHeight, 0.605263 * imageWidth, 0.789473 * imageHeight);
	            winding1.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
	            winding1.addColorStop(0.15, 'rgba(0, 0, 0, 0.32)');
	            winding1.addColorStop(0.85, 'rgba(0, 0, 0, 0.33)');
	            winding1.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
	            ctx.fillStyle = winding1;
	            ctx.fill();
	            ctx.restore();
	
	            // contact plate
	            ctx.save();
	            ctx.beginPath();
	            ctx.moveTo(0.421052 * imageWidth, 0.947368 * imageHeight);
	            ctx.bezierCurveTo(0.438596 * imageWidth, 0.956140 * imageHeight, 0.447368 * imageWidth, 0.973684 * imageHeight, 0.464912 * imageWidth, 0.991228 * imageHeight);
	            ctx.bezierCurveTo(0.473684 * imageWidth, imageHeight, 0.482456 * imageWidth, imageHeight, 0.5 * imageWidth, imageHeight);
	            ctx.bezierCurveTo(0.517543 * imageWidth, imageHeight, 0.526315 * imageWidth, 0.991228 * imageHeight, 0.535087 * imageWidth, 0.991228 * imageHeight);
	            ctx.bezierCurveTo(0.543859 * imageWidth, 0.982456 * imageHeight, 0.561403 * imageWidth, 0.956140 * imageHeight, 0.578947 * imageWidth, 0.947368 * imageHeight);
	            ctx.bezierCurveTo(0.552631 * imageWidth, 0.938596 * imageHeight, 0.526315 * imageWidth, 0.938596 * imageHeight, 0.5 * imageWidth, 0.938596 * imageHeight);
	            ctx.bezierCurveTo(0.473684 * imageWidth, 0.938596 * imageHeight, 0.447368 * imageWidth, 0.938596 * imageHeight, 0.421052 * imageWidth, 0.947368 * imageHeight);
	            ctx.closePath();
	            contactPlate = ctx.createLinearGradient(0, 0.938596 * imageHeight, 0, imageHeight);
	            contactPlate.addColorStop(0, '#050a06');
	            contactPlate.addColorStop(0.61, '#070602');
	            contactPlate.addColorStop(0.71, '#999288');
	            contactPlate.addColorStop(0.83, '#010101');
	            contactPlate.addColorStop(1, '#000000');
	            ctx.fillStyle = contactPlate;
	            ctx.fill();
	            ctx.restore();
	            ctx.restore();
	        };
	
	        var clearCanvas = function (ctx) {
	            // Store the current transformation matrix
	            ctx.save();
	
	            // Use the identity matrix while clearing the canvas
	            ctx.setTransform(1, 0, 0, 1, 0, 0);
	            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	            // Restore the transform
	            ctx.restore();
	        };
	
	        var init = function () {
	            initialized = true;
	            drawOff(offCtx);
	            drawOn(onCtx);
	            drawBulb(bulbCtx);
	        };
	
	        // **************   P U B L I C   M E T H O D S   ********************************
	        this.setOn = function (on) {
	            lightOn = !!on;
	            this.repaint();
	            return this;
	        };
	
	        this.isOn = function () {
	            return lightOn;
	        };
	
	        this.setAlpha = function (a) {
	            alpha = a;
	            this.repaint();
	            return this;
	        };
	
	        this.getAlpha = function () {
	            return alpha;
	        };
	
	        this.setGlowColor = function (color) {
	            glowColor = color;
	            init();
	            this.repaint();
	            return this;
	        };
	
	        this.getGlowColor = function () {
	            return glowColor;
	        };
	
	        // Component visualization
	        this.repaint = function () {
	            if (!initialized) {
	                init();
	            }
	
	            clearCanvas(mainCtx);
	
	            mainCtx.save();
	
	            mainCtx.drawImage(offBuffer, 0, 0);
	
	            mainCtx.globalAlpha = alpha;
	            if (lightOn) {
	                mainCtx.drawImage(onBuffer, 0, 0);
	            }
	            mainCtx.globalAlpha = 1;
	            mainCtx.drawImage(bulbBuffer, 0, 0);
	            mainCtx.restore();
	        };
	
	        this.repaint();
	
	        return this;
	    };
	
	    var odometer = function (canvas, parameters) {
	        parameters = parameters || {};
	
	        // parameters
	        var _context = (undefined === parameters._context ? null : parameters._context),  // If component used internally by steelseries
	            height = (undefined === parameters.height ? 0 : parameters.height),
	            digits = (undefined === parameters.digits ? 6 : parameters.digits),
	            decimals = (undefined === parameters.decimals ? 1 : parameters.decimals),
	            decimalBackColor = (undefined === parameters.decimalBackColor ? '#F0F0F0' : parameters.decimalBackColor),
	            decimalForeColor = (undefined === parameters.decimalForeColor ? '#F01010' : parameters.decimalForeColor),
	            font = (undefined === parameters.font ? 'sans-serif' : parameters.font),
	            value = (undefined === parameters.value ? 0 : parameters.value),
	            valueBackColor = (undefined === parameters.valueBackColor ? '#050505' : parameters.valueBackColor),
	            valueForeColor = (undefined === parameters.valueForeColor ? '#F8F8F8' : parameters.valueForeColor),
	            wobbleFactor = (undefined === parameters.wobbleFactor ? 0.07 : parameters.wobbleFactor),
	            //
	            initialized = false,
	            tween, ctx,
	            repainting = false,
	            digitHeight, digitWidth, stdFont,
	            width, columnHeight, verticalSpace, zeroOffset,
	            wobble = [],
	            //buffers
	            backgroundBuffer, backgroundContext,
	            foregroundBuffer, foregroundContext,
	            digitBuffer, digitContext,
	            decimalBuffer, decimalContext;
	            // End of variables
	
	        // Get the canvas context and clear it
	        if (_context) {
	            ctx = _context;
	        } else {
	            ctx = getCanvasContext(canvas);
	        }
	
	        // Has a height been specified?
	        if (height === 0) {
	            height = ctx.canvas.height;
	        }
	
	        // Cannot display negative values yet
	        if (value < 0) {
	            value = 0;
	        }
	
	        digitHeight = Math.floor(height * 0.85);
	        stdFont = '600 ' + digitHeight + 'px ' + font;
	
	        digitWidth = Math.floor(height * 0.68);
	        width = digitWidth * (digits + decimals);
	        columnHeight = digitHeight * 11;
	        verticalSpace = columnHeight / 12;
	        zeroOffset = verticalSpace * 0.81;
	
	        // Resize and clear the main context
	        ctx.canvas.width = width;
	        ctx.canvas.height = height;
	
	        // Create buffers
	        backgroundBuffer = createBuffer(width, height);
	        backgroundContext = backgroundBuffer.getContext('2d');
	
	        foregroundBuffer = createBuffer(width, height);
	        foregroundContext = foregroundBuffer.getContext('2d');
	
	        digitBuffer = createBuffer(digitWidth, columnHeight * 1.1);
	        digitContext = digitBuffer.getContext('2d');
	
	        decimalBuffer = createBuffer(digitWidth, columnHeight * 1.1);
	        decimalContext = decimalBuffer.getContext('2d');
	
	        function init() {
	            var grad, i;
	
	            initialized = true;
	
	            // Create the foreground
	            foregroundContext.rect(0, 0, width, height);
	            grad = foregroundContext.createLinearGradient(0, 0, 0, height);
	            grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
	            grad.addColorStop(0.1, 'rgba(0, 0, 0, 0.4)');
	            grad.addColorStop(0.33, 'rgba(255, 255, 255, 0.45)');
	            grad.addColorStop(0.46, 'rgba(255, 255, 255, 0)');
	            grad.addColorStop(0.9, 'rgba(0, 0, 0, 0.4)');
	            grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
	            foregroundContext.fillStyle = grad;
	            foregroundContext.fill();
	
	            // Create a digit column
	            // background
	            digitContext.rect(0, 0, digitWidth, columnHeight * 1.1);
	            digitContext.fillStyle = valueBackColor;
	            digitContext.fill();
	            // edges
	            digitContext.strokeStyle = '#f0f0f0';
	            digitContext.lineWidth = '1px'; //height * 0.1 + 'px';
	            digitContext.moveTo(0, 0);
	            digitContext.lineTo(0, columnHeight * 1.1);
	            digitContext.stroke();
	            digitContext.strokeStyle = '#202020';
	            digitContext.moveTo(digitWidth, 0);
	            digitContext.lineTo(digitWidth, columnHeight * 1.1);
	            digitContext.stroke();
	            // numerals
	            digitContext.textAlign = 'center';
	            digitContext.textBaseline = 'middle';
	            digitContext.font = stdFont;
	            digitContext.fillStyle = valueForeColor;
	            // put the digits 901234567890 vertically into the buffer
	            for (i = 9; i < 21; i++) {
	                digitContext.fillText(i % 10, digitWidth * 0.5, verticalSpace * (i - 9) + verticalSpace / 2);
	            }
	
	            // Create a decimal column
	            if (decimals > 0) {
	                // background
	                decimalContext.rect(0, 0, digitWidth, columnHeight * 1.1);
	                decimalContext.fillStyle = decimalBackColor;
	                decimalContext.fill();
	                // edges
	                decimalContext.strokeStyle = '#f0f0f0';
	                decimalContext.lineWidth = '1px'; //height * 0.1 + 'px';
	                decimalContext.moveTo(0, 0);
	                decimalContext.lineTo(0, columnHeight * 1.1);
	                decimalContext.stroke();
	                decimalContext.strokeStyle = '#202020';
	                decimalContext.moveTo(digitWidth, 0);
	                decimalContext.lineTo(digitWidth, columnHeight * 1.1);
	                decimalContext.stroke();
	                // numerals
	                decimalContext.textAlign = 'center';
	                decimalContext.textBaseline = 'middle';
	                decimalContext.font = stdFont;
	                decimalContext.fillStyle = decimalForeColor;
	                // put the digits 901234567890 vertically into the buffer
	                for (i = 9; i < 21; i++) {
	                    decimalContext.fillText(i % 10, digitWidth * 0.5, verticalSpace * (i - 9) + verticalSpace / 2);
	                }
	            }
	            // wobble factors
	            for (i = 0; i < (digits + decimals); i++) {
	                wobble[i] = Math.random() * wobbleFactor * height - wobbleFactor * height / 2;
	            }
	
	        }
	
	        function drawDigits() {
	            var pos = 1,
	            val = value, i, num, numb, frac, prevNum;
	
	            // do not use Math.pow() - rounding errors!
	            for (i = 0; i < decimals; i++) {
	                val *= 10;
	            }
	
	            numb = Math.floor(val);
	            frac = val - numb;
	            numb = String(numb);
	            prevNum = 9;
	
	            for (i = 0; i < decimals + digits; i++) {
	                num = +numb.substring(numb.length - i - 1, numb.length - i) || 0;
	                if (prevNum !== 9) {
	                    frac = 0;
	                }
	                if (i < decimals) {
	                    backgroundContext.drawImage(decimalBuffer, width - digitWidth * pos, -(verticalSpace * (num + frac) + zeroOffset + wobble[i]));
	                } else {
	                    backgroundContext.drawImage(digitBuffer, width - digitWidth * pos, -(verticalSpace * (num + frac) + zeroOffset + wobble[i]));
	                }
	                pos++;
	                prevNum = num;
	            }
	        }
	
	        this.setValueAnimated = function (newVal, callback) {
	            var gauge = this;
	            newVal = parseFloat(newVal);
	
	            if (newVal < 0) {
	                newVal = 0;
	            }
	            if (value !== newVal) {
	                if (undefined !== tween && tween.isPlaying) {
	                    tween.stop();
	                }
	
	                tween = new Tween({}, '', Tween.strongEaseOut, value, newVal, 2);
	                tween.onMotionChanged = function (event) {
	                    value = event.target._pos;
	                    if (!repainting) {
	                        repainting = true;
	                        requestAnimFrame(gauge.repaint);
	                    }
	                };
	
	                // do we have a callback function to process?
	                if (callback && typeof(callback) === "function") {
	                    tween.onMotionFinished = callback;
	                }
	
	                tween.start();
	            }
	            this.repaint();
	            return this;
	        };
	
	        this.setValue = function (newVal) {
	            value = parseFloat(newVal);
	            if (value < 0) {
	                value = 0;
	            }
	            this.repaint();
	            return this;
	        };
	
	        this.getValue = function () {
	            return value;
	        };
	
	        this.repaint = function () {
	            if (!initialized) {
	                init();
	            }
	
	            // draw digits
	            drawDigits();
	
	            // draw the foreground
	            backgroundContext.drawImage(foregroundBuffer, 0, 0);
	
	            // paint back to the main context
	            ctx.drawImage(backgroundBuffer, 0, 0);
	
	            repainting = false;
	        };
	
	        this.repaint();
	    };
	
	    //************************************  I M A G E   -   F U N C T I O N S  *****************************************
	
	    var drawRoseImage = function (ctx, centerX, centerY, imageWidth, imageHeight, backgroundColor) {
	        var fill = true,
	            i, grad,
	            symbolColor = backgroundColor.symbolColor.getRgbaColor();
	
	        ctx.save();
	        ctx.lineWidth = 1;
	        ctx.fillStyle = symbolColor;
	        ctx.strokeStyle = symbolColor;
	        ctx.translate(centerX, centerY);
	        // broken ring
	        for (i = 0; i < 360; i += 15) {
	            fill = !fill;
	
	            ctx.beginPath();
	            ctx.arc(0, 0, imageWidth * 0.26, i * RAD_FACTOR, (i + 15) * RAD_FACTOR, false);
	            ctx.arc(0, 0, imageWidth * 0.23, (i + 15) * RAD_FACTOR, i * RAD_FACTOR, true);
	            ctx.closePath();
	            if (fill) {
	                ctx.fill();
	            }
	            ctx.stroke();
	        }
	
	        ctx.translate(-centerX, -centerY);
	
	/*
	        // PATH1_2
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.560747, imageHeight * 0.584112);
	        ctx.lineTo(imageWidth * 0.640186, imageHeight * 0.644859);
	        ctx.lineTo(imageWidth * 0.584112, imageHeight * 0.560747);
	        ctx.lineTo(imageWidth * 0.560747, imageHeight * 0.584112);
	        ctx.closePath();
	        ctx.fillStyle = fillColorPath;
	        ctx.fill();
	        ctx.stroke();
	
	        // PATH2_2
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.411214, imageHeight * 0.560747);
	        ctx.lineTo(imageWidth * 0.355140, imageHeight * 0.644859);
	        ctx.lineTo(imageWidth * 0.439252, imageHeight * 0.588785);
	        ctx.lineTo(imageWidth * 0.411214, imageHeight * 0.560747);
	        ctx.closePath();
	        ctx.fillStyle = fillColorPath;
	        ctx.fill();
	        ctx.stroke();
	
	        // PATH3_2
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.584112, imageHeight * 0.443925);
	        ctx.lineTo(imageWidth * 0.640186, imageHeight * 0.359813);
	        ctx.lineTo(imageWidth * 0.560747, imageHeight * 0.420560);
	        ctx.lineTo(imageWidth * 0.584112, imageHeight * 0.443925);
	        ctx.closePath();
	        ctx.fillStyle = fillColorPath;
	        ctx.fill();
	        ctx.stroke();
	
	        // PATH4_2
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.439252, imageHeight * 0.415887);
	        ctx.lineTo(imageWidth * 0.355140, imageHeight * 0.359813);
	        ctx.lineTo(imageWidth * 0.415887, imageHeight * 0.439252);
	        ctx.lineTo(imageWidth * 0.439252, imageHeight * 0.415887);
	        ctx.closePath();
	        ctx.fillStyle = fillColorPath;
	        ctx.fill();
	        ctx.stroke();
	
	        // PATH5_2
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.523364, imageHeight * 0.397196);
	        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.196261);
	        ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.397196);
	        ctx.lineTo(imageWidth * 0.523364, imageHeight * 0.397196);
	        ctx.closePath();
	        var PATH5_2_GRADIENT = ctx.createLinearGradient(0.476635 * imageWidth, 0, 0.518691 * imageWidth, 0);
	        PATH5_2_GRADIENT.addColorStop(0, 'rgb(222, 223, 218)');
	        PATH5_2_GRADIENT.addColorStop(0.48, 'rgb(222, 223, 218)');
	        PATH5_2_GRADIENT.addColorStop(0.49, backgroundColor.symbolColor.getRgbaColor());
	        PATH5_2_GRADIENT.addColorStop(1, backgroundColor.symbolColor.getRgbaColor());
	        ctx.fillStyle = PATH5_2_GRADIENT;
	        ctx.fill();
	        ctx.stroke();
	
	        // PATH6_2
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.471962, imageHeight * 0.607476);
	        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.813084);
	        ctx.lineTo(imageWidth * 0.523364, imageHeight * 0.607476);
	        ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.607476);
	        ctx.closePath();
	        var PATH6_2_GRADIENT = ctx.createLinearGradient(0.518691 * imageWidth, 0, (0.518691 + -0.037383) * imageWidth, 0);
	        PATH6_2_GRADIENT.addColorStop(0, 'rgb(222, 223, 218)');
	        PATH6_2_GRADIENT.addColorStop(0.56, 'rgb(222, 223, 218)');
	        PATH6_2_GRADIENT.addColorStop(0.5601, backgroundColor.symbolColor.getRgbaColor());
	        PATH6_2_GRADIENT.addColorStop(1, backgroundColor.symbolColor.getRgbaColor());
	        ctx.fillStyle = PATH6_2_GRADIENT;
	        ctx.lineWidth = 1;
	        ctx.lineCap = 'square';
	        ctx.lineJoin = 'miter';
	        ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor();
	        ctx.fill();
	        ctx.stroke();
	
	        // PATH7_2
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.602803, imageHeight * 0.528037);
	        ctx.lineTo(imageWidth * 0.803738, imageHeight * 0.5);
	        ctx.lineTo(imageWidth * 0.602803, imageHeight * 0.476635);
	        ctx.lineTo(imageWidth * 0.602803, imageHeight * 0.528037);
	        ctx.closePath();
	        var PATH7_2_GRADIENT = ctx.createLinearGradient(0, 0.485981 * imageHeight, 0, 0.514018 * imageHeight);
	        PATH7_2_GRADIENT.addColorStop(0, 'rgb(222, 223, 218)');
	        PATH7_2_GRADIENT.addColorStop(0.48, 'rgb(222, 223, 218)');
	        PATH7_2_GRADIENT.addColorStop(0.49, backgroundColor.symbolColor.getRgbaColor());
	        PATH7_2_GRADIENT.addColorStop(1, backgroundColor.symbolColor.getRgbaColor());
	        ctx.fillStyle = PATH7_2_GRADIENT;
	        ctx.fill();
	        ctx.stroke();
	
	        // PATH8_2
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.392523, imageHeight * 0.476635);
	        ctx.lineTo(imageWidth * 0.191588, imageHeight * 0.5);
	        ctx.lineTo(imageWidth * 0.392523, imageHeight * 0.528037);
	        ctx.lineTo(imageWidth * 0.392523, imageHeight * 0.476635);
	        ctx.closePath();
	        var PATH8_2_GRADIENT = ctx.createLinearGradient(0, 0.528037 * imageHeight, 0, 0.485981 * imageHeight);
	        PATH8_2_GRADIENT.addColorStop(0, 'rgb(222, 223, 218)');
	        PATH8_2_GRADIENT.addColorStop(0.52, 'rgb(222, 223, 218)');
	        PATH8_2_GRADIENT.addColorStop(0.53, backgroundColor.symbolColor.getRgbaColor());
	        PATH8_2_GRADIENT.addColorStop(1, backgroundColor.symbolColor.getRgbaColor());
	        ctx.fillStyle = PATH8_2_GRADIENT;
	        ctx.fill();
	        ctx.stroke();
	
	        // PATH9_2
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.406542, imageHeight * 0.504672);
	        ctx.bezierCurveTo(imageWidth * 0.406542, imageHeight * 0.453271, imageWidth * 0.448598, imageHeight * 0.411214, imageWidth * 0.5, imageHeight * 0.411214);
	        ctx.bezierCurveTo(imageWidth * 0.546728, imageHeight * 0.411214, imageWidth * 0.588785, imageHeight * 0.453271, imageWidth * 0.588785, imageHeight * 0.504672);
	        ctx.bezierCurveTo(imageWidth * 0.588785, imageHeight * 0.551401, imageWidth * 0.546728, imageHeight * 0.593457, imageWidth * 0.5, imageHeight * 0.593457);
	        ctx.bezierCurveTo(imageWidth * 0.448598, imageHeight * 0.593457, imageWidth * 0.406542, imageHeight * 0.551401, imageWidth * 0.406542, imageHeight * 0.504672);
	        ctx.closePath();
	        ctx.moveTo(imageWidth * 0.387850, imageHeight * 0.504672);
	        ctx.bezierCurveTo(imageWidth * 0.387850, imageHeight * 0.560747, imageWidth * 0.439252, imageHeight * 0.612149, imageWidth * 0.5, imageHeight * 0.612149);
	        ctx.bezierCurveTo(imageWidth * 0.556074, imageHeight * 0.612149, imageWidth * 0.607476, imageHeight * 0.560747, imageWidth * 0.607476, imageHeight * 0.504672);
	        ctx.bezierCurveTo(imageWidth * 0.607476, imageHeight * 0.443925, imageWidth * 0.556074, imageHeight * 0.392523, imageWidth * 0.5, imageHeight * 0.392523);
	        ctx.bezierCurveTo(imageWidth * 0.439252, imageHeight * 0.392523, imageWidth * 0.387850, imageHeight * 0.443925, imageWidth * 0.387850, imageHeight * 0.504672);
	        ctx.closePath();
	        ctx.fillStyle = fillColorPath;
	        ctx.lineWidth = 1;
	        ctx.lineCap = 'square';
	        ctx.lineJoin = 'miter';
	        ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor();
	        ctx.fill();
	        ctx.stroke();
	        ctx.restore();
	*/
	        // Replacement code, not quite the same but much smaller!
	
	        for (i = 0; 360 >= i; i += 90) {
	            // Small pointers
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.560747, imageHeight * 0.584112);
	            ctx.lineTo(imageWidth * 0.640186, imageHeight * 0.644859);
	            ctx.lineTo(imageWidth * 0.584112, imageHeight * 0.560747);
	            ctx.lineTo(imageWidth * 0.560747, imageHeight * 0.584112);
	            ctx.closePath();
	            ctx.fillStyle = symbolColor;
	            ctx.fill();
	            ctx.stroke();
	            // Large pointers
	            ctx.beginPath();
	            ctx.moveTo(imageWidth * 0.523364, imageHeight * 0.397196);
	            ctx.lineTo(imageWidth * 0.5, imageHeight * 0.196261);
	            ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.397196);
	            ctx.lineTo(imageWidth * 0.523364, imageHeight * 0.397196);
	            ctx.closePath();
	            grad = ctx.createLinearGradient(0.476635 * imageWidth, 0, 0.518691 * imageWidth, 0);
	            grad.addColorStop(0, 'rgb(222, 223, 218)');
	            grad.addColorStop(0.48, 'rgb(222, 223, 218)');
	            grad.addColorStop(0.49, symbolColor);
	            grad.addColorStop(1, symbolColor);
	            ctx.fillStyle = grad;
	            ctx.fill();
	            ctx.stroke();
	            ctx.translate(centerX, centerY);
	            ctx.rotate(i * RAD_FACTOR);
	            ctx.translate(-centerX, -centerY);
	        }
	
	        // Central ring
	        ctx.beginPath();
	        ctx.translate(centerX, centerY);
	        ctx.arc(0, 0, imageWidth * 0.1, 0, TWO_PI, false);
	        ctx.lineWidth = imageWidth * 0.022;
	        ctx.stroke();
	        ctx.translate(-centerX, -centerY);
	
	        ctx.restore();
	
	    };
	
	    var drawPointerImage = function (ctx, size, ptrType, ptrColor, lblColor) {
	        var ptrBuffer, ptrCtx,
	            grad, radius,
	            cacheKey = size.toString() + ptrType.type + ptrColor.light.getHexColor() + ptrColor.medium.getHexColor();
	
	        // check if we have already created and cached this buffer, if not create it
	        if (!drawPointerImage.cache[cacheKey]) {
	            // create a pointer buffer
	            ptrBuffer = createBuffer(size, size);
	            ptrCtx = ptrBuffer.getContext('2d');
	
	            switch (ptrType.type) {
	            case 'type2':
	                grad = ptrCtx.createLinearGradient(0, size * 0.471962, 0, size * 0.130841);
	                grad.addColorStop(0, lblColor.getRgbaColor());
	                grad.addColorStop(0.36, lblColor.getRgbaColor());
	                grad.addColorStop(0.361, ptrColor.light.getRgbaColor());
	                grad.addColorStop(1, ptrColor.light.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.518691, size * 0.471962);
	                ptrCtx.lineTo(size * 0.509345, size * 0.462616);
	                ptrCtx.lineTo(size * 0.509345, size * 0.341121);
	                ptrCtx.lineTo(size * 0.504672, size * 0.130841);
	                ptrCtx.lineTo(size * 0.495327, size * 0.130841);
	                ptrCtx.lineTo(size * 0.490654, size * 0.341121);
	                ptrCtx.lineTo(size * 0.490654, size * 0.462616);
	                ptrCtx.lineTo(size * 0.481308, size * 0.471962);
	                ptrCtx.closePath();
	                ptrCtx.fill();
	                break;
	
	            case 'type3':
	                ptrCtx.beginPath();
	                ptrCtx.rect(size * 0.495327, size * 0.130841, size * 0.009345, size * 0.373831);
	                ptrCtx.closePath();
	                ptrCtx.fillStyle = ptrColor.light.getRgbaColor();
	                ptrCtx.fill();
	                break;
	
	            case 'type4':
	                grad = ptrCtx.createLinearGradient(0.467289 * size, 0, 0.528036 * size, 0);
	                grad.addColorStop(0, ptrColor.dark.getRgbaColor());
	                grad.addColorStop(0.51, ptrColor.dark.getRgbaColor());
	                grad.addColorStop(0.52, ptrColor.light.getRgbaColor());
	                grad.addColorStop(1, ptrColor.light.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.5, size * 0.126168);
	                ptrCtx.lineTo(size * 0.514018, size * 0.135514);
	                ptrCtx.lineTo(size * 0.532710, size * 0.5);
	                ptrCtx.lineTo(size * 0.523364, size * 0.602803);
	                ptrCtx.lineTo(size * 0.476635, size * 0.602803);
	                ptrCtx.lineTo(size * 0.467289, size * 0.5);
	                ptrCtx.lineTo(size * 0.485981, size * 0.135514);
	                ptrCtx.lineTo(size * 0.5, size * 0.126168);
	                ptrCtx.closePath();
	                ptrCtx.fill();
	                break;
	
	            case 'type5':
	                grad = ptrCtx.createLinearGradient(0.471962 * size, 0, 0.528036 * size, 0);
	                grad.addColorStop(0, ptrColor.light.getRgbaColor());
	                grad.addColorStop(0.5, ptrColor.light.getRgbaColor());
	                grad.addColorStop(0.5, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(1, ptrColor.medium.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.5, size * 0.495327);
	                ptrCtx.lineTo(size * 0.528037, size * 0.495327);
	                ptrCtx.lineTo(size * 0.5, size * 0.149532);
	                ptrCtx.lineTo(size * 0.471962, size * 0.495327);
	                ptrCtx.lineTo(size * 0.5, size * 0.495327);
	                ptrCtx.closePath();
	                ptrCtx.fill();
	
	                ptrCtx.lineWidth = 1;
	                ptrCtx.lineCap = 'square';
	                ptrCtx.lineJoin = 'miter';
	                ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
	                ptrCtx.stroke();
	                break;
	
	            case 'type6':
	                ptrCtx.fillStyle = ptrColor.medium.getRgbaColor();
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.481308, size * 0.485981);
	                ptrCtx.lineTo(size * 0.481308, size * 0.392523);
	                ptrCtx.lineTo(size * 0.485981, size * 0.317757);
	                ptrCtx.lineTo(size * 0.495327, size * 0.130841);
	                ptrCtx.lineTo(size * 0.504672, size * 0.130841);
	                ptrCtx.lineTo(size * 0.514018, size * 0.317757);
	                ptrCtx.lineTo(size * 0.518691, size * 0.387850);
	                ptrCtx.lineTo(size * 0.518691, size * 0.485981);
	                ptrCtx.lineTo(size * 0.504672, size * 0.485981);
	                ptrCtx.lineTo(size * 0.504672, size * 0.387850);
	                ptrCtx.lineTo(size * 0.5, size * 0.317757);
	                ptrCtx.lineTo(size * 0.495327, size * 0.392523);
	                ptrCtx.lineTo(size * 0.495327, size * 0.485981);
	                ptrCtx.lineTo(size * 0.481308, size * 0.485981);
	                ptrCtx.closePath();
	                ptrCtx.fill();
	                break;
	
	            case 'type7':
	                grad = ptrCtx.createLinearGradient(0.481308 * size, 0, 0.518691 * size, 0);
	                grad.addColorStop(0, ptrColor.dark.getRgbaColor());
	                grad.addColorStop(1, ptrColor.medium.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.490654, size * 0.130841);
	                ptrCtx.lineTo(size * 0.481308, size * 0.5);
	                ptrCtx.lineTo(size * 0.518691, size * 0.5);
	                ptrCtx.lineTo(size * 0.504672, size * 0.130841);
	                ptrCtx.lineTo(size * 0.490654, size * 0.130841);
	                ptrCtx.closePath();
	                ptrCtx.fill();
	                break;
	
	            case 'type8':
	                grad = ptrCtx.createLinearGradient(0.471962 * size, 0, 0.528036 * size, 0);
	                grad.addColorStop(0, ptrColor.light.getRgbaColor());
	                grad.addColorStop(0.5, ptrColor.light.getRgbaColor());
	                grad.addColorStop(0.5, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(1, ptrColor.medium.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.5, size * 0.532710);
	                ptrCtx.lineTo(size * 0.532710, size * 0.5);
	                ptrCtx.bezierCurveTo(size * 0.532710, size * 0.5, size * 0.509345, size * 0.457943, size * 0.5, size * 0.149532);
	                ptrCtx.bezierCurveTo(size * 0.490654, size * 0.457943, size * 0.467289, size * 0.5, size * 0.467289, size * 0.5);
	                ptrCtx.lineTo(size * 0.5, size * 0.532710);
	                ptrCtx.closePath();
	                ptrCtx.fill();
	                ptrCtx.stroke();
	                break;
	
	            case 'type9':
	                grad = ptrCtx.createLinearGradient(0.471962 * size, 0, 0.528036 * size, 0);
	                grad.addColorStop(0, 'rgb(50, 50, 50)');
	                grad.addColorStop(0.5, '#666666');
	                grad.addColorStop(1, 'rgb(50, 50, 50)');
	                ptrCtx.fillStyle = grad;
	                ptrCtx.strokeStyle = '#2E2E2E';
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.495327, size * 0.233644);
	                ptrCtx.lineTo(size * 0.504672, size * 0.233644);
	                ptrCtx.lineTo(size * 0.514018, size * 0.439252);
	                ptrCtx.lineTo(size * 0.485981, size * 0.439252);
	                ptrCtx.lineTo(size * 0.495327, size * 0.233644);
	                ptrCtx.closePath();
	                ptrCtx.moveTo(size * 0.490654, size * 0.130841);
	                ptrCtx.lineTo(size * 0.471962, size * 0.471962);
	                ptrCtx.lineTo(size * 0.471962, size * 0.528037);
	                ptrCtx.bezierCurveTo(size * 0.471962, size * 0.528037, size * 0.476635, size * 0.602803, size * 0.476635, size * 0.602803);
	                ptrCtx.bezierCurveTo(size * 0.476635, size * 0.607476, size * 0.481308, size * 0.607476, size * 0.5, size * 0.607476);
	                ptrCtx.bezierCurveTo(size * 0.518691, size * 0.607476, size * 0.523364, size * 0.607476, size * 0.523364, size * 0.602803);
	                ptrCtx.bezierCurveTo(size * 0.523364, size * 0.602803, size * 0.528037, size * 0.528037, size * 0.528037, size * 0.528037);
	                ptrCtx.lineTo(size * 0.528037, size * 0.471962);
	                ptrCtx.lineTo(size * 0.509345, size * 0.130841);
	                ptrCtx.lineTo(size * 0.490654, size * 0.130841);
	                ptrCtx.closePath();
	                ptrCtx.fill();
	
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.495327, size * 0.219626);
	                ptrCtx.lineTo(size * 0.504672, size * 0.219626);
	                ptrCtx.lineTo(size * 0.504672, size * 0.135514);
	                ptrCtx.lineTo(size * 0.495327, size * 0.135514);
	                ptrCtx.lineTo(size * 0.495327, size * 0.219626);
	                ptrCtx.closePath();
	
	                ptrCtx.fillStyle = ptrColor.medium.getRgbaColor();
	                ptrCtx.fill();
	                break;
	
	            case 'type10':
	                // POINTER_TYPE10
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.5, size * 0.149532);
	                ptrCtx.bezierCurveTo(size * 0.5, size * 0.149532, size * 0.443925, size * 0.490654, size * 0.443925, size * 0.5);
	                ptrCtx.bezierCurveTo(size * 0.443925, size * 0.532710, size * 0.467289, size * 0.556074, size * 0.5, size * 0.556074);
	                ptrCtx.bezierCurveTo(size * 0.532710, size * 0.556074, size * 0.556074, size * 0.532710, size * 0.556074, size * 0.5);
	                ptrCtx.bezierCurveTo(size * 0.556074, size * 0.490654, size * 0.5, size * 0.149532, size * 0.5, size * 0.149532);
	                ptrCtx.closePath();
	                grad = ptrCtx.createLinearGradient(0.471962 * size, 0, 0.528036 * size, 0);
	                grad.addColorStop(0, ptrColor.light.getRgbaColor());
	                grad.addColorStop(0.5, ptrColor.light.getRgbaColor());
	                grad.addColorStop(0.5, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(1, ptrColor.medium.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.strokeStyle = ptrColor.medium.getRgbaColor();
	                ptrCtx.lineWidth = 1;
	                ptrCtx.lineCap = 'square';
	                ptrCtx.lineJoin = 'miter';
	                ptrCtx.fill();
	                ptrCtx.stroke();
	                break;
	
	            case 'type11':
	                // POINTER_TYPE11
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(0.5 * size, 0.168224 * size);
	                ptrCtx.lineTo(0.485981 * size, 0.5 * size);
	                ptrCtx.bezierCurveTo(0.485981 * size, 0.5 * size, 0.481308 * size, 0.584112 * size, 0.5 * size, 0.584112 * size);
	                ptrCtx.bezierCurveTo(0.514018 * size, 0.584112 * size, 0.509345 * size, 0.5 * size, 0.509345 * size, 0.5 * size);
	                ptrCtx.lineTo(0.5 * size, 0.168224 * size);
	                ptrCtx.closePath();
	                grad = ptrCtx.createLinearGradient(0, 0.168224 * size, 0, 0.584112 * size);
	                grad.addColorStop(0, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(1, ptrColor.dark.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
	                ptrCtx.fill();
	                ptrCtx.stroke();
	                break;
	
	            case 'type12':
	                // POINTER_TYPE12
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(0.5 * size, 0.168224 * size);
	                ptrCtx.lineTo(0.485981 * size, 0.5 * size);
	                ptrCtx.lineTo(0.5 * size, 0.504672 * size);
	                ptrCtx.lineTo(0.509345 * size, 0.5 * size);
	                ptrCtx.lineTo(0.5 * size, 0.168224 * size);
	                ptrCtx.closePath();
	                grad = ptrCtx.createLinearGradient(0, 0.168224 * size, 0, 0.504672 * size);
	                grad.addColorStop(0, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(1, ptrColor.dark.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
	                ptrCtx.fill();
	                ptrCtx.stroke();
	                break;
	
	            case 'type13':
	                // POINTER_TYPE13
	            case 'type14':
	                // POINTER_TYPE14 (same shape as 13)
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(0.485981 * size, 0.168224 * size);
	                ptrCtx.lineTo(0.5 * size, 0.130841 * size);
	                ptrCtx.lineTo(0.509345 * size, 0.168224 * size);
	                ptrCtx.lineTo(0.509345 * size, 0.509345 * size);
	                ptrCtx.lineTo(0.485981 * size, 0.509345 * size);
	                ptrCtx.lineTo(0.485981 * size, 0.168224 * size);
	                ptrCtx.closePath();
	                if (ptrType.type === 'type13') {
	                    // TYPE13
	                    grad = ptrCtx.createLinearGradient(0, 0.5 * size, 0, 0.130841 * size);
	                    grad.addColorStop(0, lblColor.getRgbaColor());
	                    grad.addColorStop(0.85, lblColor.getRgbaColor());
	                    grad.addColorStop(0.85, ptrColor.medium.getRgbaColor());
	                    grad.addColorStop(1, ptrColor.medium.getRgbaColor());
	                    ptrCtx.fillStyle = grad;
	                } else {
	                    // TYPE14
	                    grad = ptrCtx.createLinearGradient(0.485981 * size, 0, 0.509345 * size, 0);
	                    grad.addColorStop(0, ptrColor.veryDark.getRgbaColor());
	                    grad.addColorStop(0.5, ptrColor.light.getRgbaColor());
	                    grad.addColorStop(1, ptrColor.veryDark.getRgbaColor());
	                    ptrCtx.fillStyle = grad;
	                }
	                ptrCtx.fill();
	                break;
	
	            case 'type15':
	                // POINTER TYPE15 - Classic with crescent
	            case 'type16':
	                // POINTER TYPE16 - Classic without crescent
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.509345, size * 0.457943);
	                ptrCtx.lineTo(size * 0.5015, size * 0.13);
	                ptrCtx.lineTo(size * 0.4985, size * 0.13);
	                ptrCtx.lineTo(size * 0.490654, size * 0.457943);
	                ptrCtx.bezierCurveTo(size * 0.490654, size * 0.457943, size * 0.490654, size * 0.457943, size * 0.490654, size * 0.457943);
	                ptrCtx.bezierCurveTo(size * 0.471962, size * 0.462616, size * 0.457943, size * 0.481308, size * 0.457943, size * 0.5);
	                ptrCtx.bezierCurveTo(size * 0.457943, size * 0.518691, size * 0.471962, size * 0.537383, size * 0.490654, size * 0.542056);
	                ptrCtx.bezierCurveTo(size * 0.490654, size * 0.542056, size * 0.490654, size * 0.542056, size * 0.490654, size * 0.542056);
	                if (ptrType.type === 'type15') {
	                    ptrCtx.lineTo(size * 0.490654, size * 0.57);
	                    ptrCtx.bezierCurveTo(size * 0.46, size * 0.58, size * 0.46, size * 0.62, size * 0.490654, size * 0.63);
	                    ptrCtx.bezierCurveTo(size * 0.47, size * 0.62, size * 0.48, size * 0.59, size * 0.5, size * 0.59);
	                    ptrCtx.bezierCurveTo(size * 0.53, size * 0.59, size * 0.52, size * 0.62, size * 0.509345, size * 0.63);
	                    ptrCtx.bezierCurveTo(size * 0.54, size * 0.62, size * 0.54, size * 0.58, size * 0.509345, size * 0.57);
	                    ptrCtx.lineTo(size * 0.509345, size * 0.57);
	                } else {
	                    ptrCtx.lineTo(size * 0.490654, size * 0.621495);
	                    ptrCtx.lineTo(size * 0.509345, size * 0.621495);
	                }
	                ptrCtx.lineTo(size * 0.509345, size * 0.542056);
	                ptrCtx.bezierCurveTo(size * 0.509345, size * 0.542056, size * 0.509345, size * 0.542056, size * 0.509345, size * 0.542056);
	                ptrCtx.bezierCurveTo(size * 0.528037, size * 0.537383, size * 0.542056, size * 0.518691, size * 0.542056, size * 0.5);
	                ptrCtx.bezierCurveTo(size * 0.542056, size * 0.481308, size * 0.528037, size * 0.462616, size * 0.509345, size * 0.457943);
	                ptrCtx.bezierCurveTo(size * 0.509345, size * 0.457943, size * 0.509345, size * 0.457943, size * 0.509345, size * 0.457943);
	                ptrCtx.closePath();
	                if (ptrType.type === 'type15') {
	                    grad = ptrCtx.createLinearGradient(0, 0, 0, size * 0.63);
	                } else {
	                    grad = ptrCtx.createLinearGradient(0, 0, 0, size * 0.621495);
	                }
	                grad.addColorStop(0, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(0.388888, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(0.5, ptrColor.light.getRgbaColor());
	                grad.addColorStop(0.611111, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(1, ptrColor.medium.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
	                ptrCtx.fill();
	                ptrCtx.stroke();
	                // Draw the rings
	                ptrCtx.beginPath();
	                radius = size * 0.065420 / 2;
	                ptrCtx.arc(size * 0.5, size * 0.5, radius, 0, TWO_PI);
	                grad = ptrCtx.createLinearGradient(size * 0.5 - radius, size * 0.5 + radius, 0, size * 0.5 + radius);
	                grad.addColorStop(0, '#e6b35c');
	                grad.addColorStop(0.01, '#e6b35c');
	                grad.addColorStop(0.99, '#c48200');
	                grad.addColorStop(1, '#c48200');
	                ptrCtx.fillStyle = grad;
	                ptrCtx.closePath();
	                ptrCtx.fill();
	                ptrCtx.beginPath();
	                radius = size * 0.046728 / 2;
	                ptrCtx.arc(size * 0.5, size * 0.5, radius, 0, TWO_PI);
	                grad = ptrCtx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, radius);
	                grad.addColorStop(0, '#c5c5c5');
	                grad.addColorStop(0.19, '#c5c5c5');
	                grad.addColorStop(0.22, '#000000');
	                grad.addColorStop(0.8, '#000000');
	                grad.addColorStop(0.99, '#707070');
	                grad.addColorStop(1, '#707070');
	                ptrCtx.fillStyle = grad;
	                ptrCtx.closePath();
	                ptrCtx.fill();
	                break;
	
	            case 'type1':
	            /* falls through */
	            default:
	                grad = ptrCtx.createLinearGradient(0, size * 0.471962, 0, size * 0.130841);
	                grad.addColorStop(0, ptrColor.veryDark.getRgbaColor());
	                grad.addColorStop(0.3, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(0.59, ptrColor.medium.getRgbaColor());
	                grad.addColorStop(1, ptrColor.veryDark.getRgbaColor());
	                ptrCtx.fillStyle = grad;
	                ptrCtx.beginPath();
	                ptrCtx.moveTo(size * 0.518691, size * 0.471962);
	                ptrCtx.bezierCurveTo(size * 0.514018, size * 0.457943, size * 0.509345, size * 0.415887, size * 0.509345, size * 0.401869);
	                ptrCtx.bezierCurveTo(size * 0.504672, size * 0.383177, size * 0.5, size * 0.130841, size * 0.5, size * 0.130841);
	                ptrCtx.bezierCurveTo(size * 0.5, size * 0.130841, size * 0.490654, size * 0.383177, size * 0.490654, size * 0.397196);
	                ptrCtx.bezierCurveTo(size * 0.490654, size * 0.415887, size * 0.485981, size * 0.457943, size * 0.481308, size * 0.471962);
	                ptrCtx.bezierCurveTo(size * 0.471962, size * 0.481308, size * 0.467289, size * 0.490654, size * 0.467289, size * 0.5);
	                ptrCtx.bezierCurveTo(size * 0.467289, size * 0.518691, size * 0.481308, size * 0.532710, size * 0.5, size * 0.532710);
	                ptrCtx.bezierCurveTo(size * 0.518691, size * 0.532710, size * 0.532710, size * 0.518691, size * 0.532710, size * 0.5);
	                ptrCtx.bezierCurveTo(size * 0.532710, size * 0.490654, size * 0.528037, size * 0.481308, size * 0.518691, size * 0.471962);
	                ptrCtx.closePath();
	                ptrCtx.fill();
	                break;
	            }
	            // cache buffer
	            drawPointerImage.cache[cacheKey] = ptrBuffer;
	        }
	        ctx.drawImage(drawPointerImage.cache[cacheKey], 0, 0);
	        return this;
	    };
	    drawPointerImage.cache = {};
	
	    var drawRadialFrameImage = function (ctx, frameDesign, centerX, centerY, imageWidth, imageHeight) {
	        var radFBuffer, radFCtx,
	            grad, outerX, innerX, fractions, colors,
	            cacheKey = imageWidth.toString() + imageHeight + frameDesign.design;
	
	        // check if we have already created and cached this buffer, if not create it
	        if (!drawRadialFrameImage.cache[cacheKey]) {
	            // Setup buffer
	            radFBuffer = createBuffer(imageWidth, imageHeight);
	            radFCtx = radFBuffer.getContext('2d');
	
	            // outer gray frame
	            radFCtx.fillStyle = '#848484';
	            radFCtx.strokeStyle = 'rgba(132, 132, 132, 0.5)';
	            radFCtx.beginPath();
	            radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true);
	            radFCtx.closePath();
	            radFCtx.fill();
	            radFCtx.stroke();
	
	            radFCtx.beginPath();
	            radFCtx.arc(centerX, centerY, imageWidth * 0.990654 / 2, 0, TWO_PI, true);
	            radFCtx.closePath();
	
	            // main gradient frame
	            switch (frameDesign.design) {
	            case 'metal':
	                grad = radFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
	                grad.addColorStop(0, '#fefefe');
	                grad.addColorStop(0.07, 'rgb(210, 210, 210)');
	                grad.addColorStop(0.12, 'rgb(179, 179, 179)');
	                grad.addColorStop(1, 'rgb(213, 213, 213)');
	                radFCtx.fillStyle = grad;
	                radFCtx.fill();
	                break;
	
	            case 'brass':
	                grad = radFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
	                grad.addColorStop(0, 'rgb(249, 243, 155)');
	                grad.addColorStop(0.05, 'rgb(246, 226, 101)');
	                grad.addColorStop(0.10, 'rgb(240, 225, 132)');
	                grad.addColorStop(0.50, 'rgb(90, 57, 22)');
	                grad.addColorStop(0.90, 'rgb(249, 237, 139)');
	                grad.addColorStop(0.95, 'rgb(243, 226, 108)');
	                grad.addColorStop(1, 'rgb(202, 182, 113)');
	                radFCtx.fillStyle = grad;
	                radFCtx.fill();
	                break;
	
	            case 'steel':
	                grad = radFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
	                grad.addColorStop(0, 'rgb(231, 237, 237)');
	                grad.addColorStop(0.05, 'rgb(189, 199, 198)');
	                grad.addColorStop(0.10, 'rgb(192, 201, 200)');
	                grad.addColorStop(0.50, 'rgb(23, 31, 33)');
	                grad.addColorStop(0.90, 'rgb(196, 205, 204)');
	                grad.addColorStop(0.95, 'rgb(194, 204, 203)');
	                grad.addColorStop(1, 'rgb(189, 201, 199)');
	                radFCtx.fillStyle = grad;
	                radFCtx.fill();
	                break;
	
	            case 'gold':
	                grad = radFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
	                grad.addColorStop(0, 'rgb(255, 255, 207)');
	                grad.addColorStop(0.15, 'rgb(255, 237, 96)');
	                grad.addColorStop(0.22, 'rgb(254, 199, 57)');
	                grad.addColorStop(0.3, 'rgb(255, 249, 203)');
	                grad.addColorStop(0.38, 'rgb(255, 199, 64)');
	                grad.addColorStop(0.44, 'rgb(252, 194, 60)');
	                grad.addColorStop(0.51, 'rgb(255, 204, 59)');
	                grad.addColorStop(0.6, 'rgb(213, 134, 29)');
	                grad.addColorStop(0.68, 'rgb(255, 201, 56)');
	                grad.addColorStop(0.75, 'rgb(212, 135, 29)');
	                grad.addColorStop(1, 'rgb(247, 238, 101)');
	                radFCtx.fillStyle = grad;
	                radFCtx.fill();
	                break;
	
	            case 'anthracite':
	                grad = radFCtx.createLinearGradient(0, 0.004672 * imageHeight, 0, 0.995326 * imageHeight);
	                grad.addColorStop(0, 'rgb(118, 117, 135)');
	                grad.addColorStop(0.06, 'rgb(74, 74, 82)');
	                grad.addColorStop(0.12, 'rgb(50, 50, 54)');
	                grad.addColorStop(1, 'rgb(79, 79, 87)');
	                radFCtx.fillStyle = grad;
	                radFCtx.fill();
	                break;
	
	            case 'tiltedGray':
	                grad = radFCtx.createLinearGradient(0.233644 * imageWidth, 0.084112 * imageHeight, 0.81258 * imageWidth, 0.910919 * imageHeight);
	                grad.addColorStop(0, '#ffffff');
	                grad.addColorStop(0.07, 'rgb(210, 210, 210)');
	                grad.addColorStop(0.16, 'rgb(179, 179, 179)');
	                grad.addColorStop(0.33, '#ffffff');
	                grad.addColorStop(0.55, '#c5c5c5');
	                grad.addColorStop(0.79, '#ffffff');
	                grad.addColorStop(1, '#666666');
	                radFCtx.fillStyle = grad;
	                radFCtx.fill();
	                break;
	
	            case 'tiltedBlack':
	                grad = radFCtx.createLinearGradient(0.228971 * imageWidth, 0.079439 * imageHeight, 0.802547 * imageWidth, 0.898591 * imageHeight);
	                grad.addColorStop(0, '#666666');
	                grad.addColorStop(0.21, '#000000');
	                grad.addColorStop(0.47, '#666666');
	                grad.addColorStop(0.99, '#000000');
	                grad.addColorStop(1, '#000000');
	                radFCtx.fillStyle = grad;
	                radFCtx.fill();
	                break;
	
	            case 'glossyMetal':
	                grad = radFCtx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageWidth, 0.5 * imageWidth);
	                grad.addColorStop(0, 'rgb(207, 207, 207)');
	                grad.addColorStop(0.96, 'rgb(205, 204, 205)');
	                grad.addColorStop(1, 'rgb(244, 244, 244)');
	                radFCtx.fillStyle = grad;
	                radFCtx.fill();
	                radFCtx.beginPath();
	                radFCtx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.973962 * imageWidth / 2, 0, TWO_PI);
	                radFCtx.closePath();
	                grad = radFCtx.createLinearGradient(0, imageHeight - 0.971962 * imageHeight, 0, 0.971962 * imageHeight);
	                grad.addColorStop(0, 'rgb(249, 249, 249)');
	                grad.addColorStop(0.23, 'rgb(200, 195, 191)');
	                grad.addColorStop(0.36, '#ffffff');
	                grad.addColorStop(0.59, 'rgb(29, 29, 29)');
	                grad.addColorStop(0.76, 'rgb(200, 194, 192)');
	                grad.addColorStop(1, 'rgb(209, 209, 209)');
	                radFCtx.fillStyle = grad;
	                radFCtx.fill();
	
	                radFCtx.beginPath();
	                radFCtx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.869158 * imageWidth / 2, 0, TWO_PI);
	                radFCtx.closePath();
	                radFCtx.fillStyle = '#f6f6f6';
	                radFCtx.fill();
	
	                radFCtx.beginPath();
	                radFCtx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.85 * imageWidth / 2, 0, TWO_PI);
	                radFCtx.closePath();
	                radFCtx.fillStyle = '#333333';
	                radFCtx.fill();
	                break;
	
	            case 'blackMetal':
	                fractions = [0,
	                             0.125,
	                             0.347222,
	                             0.5,
	                             0.680555,
	                             0.875,
	                             1];
	
	                colors = [ new RgbaColor(254, 254, 254, 1),
	                           new RgbaColor(0, 0, 0, 1),
	                           new RgbaColor(153, 153, 153, 1),
	                           new RgbaColor(0, 0, 0, 1),
	                           new RgbaColor(153, 153, 153, 1),
	                           new RgbaColor(0, 0, 0, 1),
	                           new RgbaColor(254, 254, 254, 1)];
	
	                radFCtx.save();
	                radFCtx.arc(centerX, centerY, imageWidth * 0.990654 / 2, 0, TWO_PI, true);
	                radFCtx.clip();
	                outerX = imageWidth * 0.495327;
	                innerX = imageWidth * 0.420560;
	                grad = new ConicalGradient(fractions, colors);
	                grad.fillCircle(radFCtx, centerX, centerY, innerX, outerX);
	                // fade outer edge
	                radFCtx.strokeStyle = '#848484';
	                radFCtx.strokeStyle = 'rgba(132, 132, 132, 0.8)';
	                radFCtx.beginPath();
	                radFCtx.lineWidth = imageWidth / 90;
	                radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true);
	                radFCtx.closePath();
	                radFCtx.stroke();
	                radFCtx.restore();
	                break;
	
	            case 'shinyMetal':
	                fractions = [0,
	                             0.125,
	                             0.25,
	                             0.347222,
	                             0.5,
	                             0.652777,
	                             0.75,
	                             0.875,
	                             1];
	
	                colors = [ new RgbaColor(254, 254, 254, 1),
	                           new RgbaColor(210, 210, 210, 1),
	                           new RgbaColor(179, 179, 179, 1),
	                           new RgbaColor(238, 238, 238, 1),
	                           new RgbaColor(160, 160, 160, 1),
	                           new RgbaColor(238, 238, 238, 1),
	                           new RgbaColor(179, 179, 179, 1),
	                           new RgbaColor(210, 210, 210, 1),
	                           new RgbaColor(254, 254, 254, 1)];
	
	                radFCtx.save();
	                radFCtx.arc(centerX, centerY, imageWidth * 0.990654 / 2, 0, TWO_PI, true);
	                radFCtx.clip();
	                outerX = imageWidth * 0.495327;
	                innerX = imageWidth * 0.420560;
	                grad = new ConicalGradient(fractions, colors);
	                grad.fillCircle(radFCtx, centerX, centerY, innerX, outerX);
	                // fade outer edge
	                radFCtx.strokeStyle = '#848484';
	                radFCtx.strokeStyle = 'rgba(132, 132, 132, 0.8)';
	                radFCtx.beginPath();
	                radFCtx.lineWidth = imageWidth / 90;
	                radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true);
	                radFCtx.closePath();
	                radFCtx.stroke();
	                radFCtx.restore();
	                break;
	
	            case 'chrome':
	                fractions = [0,
	                             0.09,
	                             0.12,
	                             0.16,
	                             0.25,
	                             0.29,
	                             0.33,
	                             0.38,
	                             0.48,
	                             0.52,
	                             0.63,
	                             0.68,
	                             0.8,
	                             0.83,
	                             0.87,
	                             0.97,
	                             1];
	
	                colors = [ new RgbaColor(255, 255, 255, 1),
	                           new RgbaColor(255, 255, 255, 1),
	                           new RgbaColor(136, 136, 138, 1),
	                           new RgbaColor(164, 185, 190, 1),
	                           new RgbaColor(158, 179, 182, 1),
	                           new RgbaColor(112, 112, 112, 1),
	                           new RgbaColor(221, 227, 227, 1),
	                           new RgbaColor(155, 176, 179, 1),
	                           new RgbaColor(156, 176, 177, 1),
	                           new RgbaColor(254, 255, 255, 1),
	                           new RgbaColor(255, 255, 255, 1),
	                           new RgbaColor(156, 180, 180, 1),
	                           new RgbaColor(198, 209, 211, 1),
	                           new RgbaColor(246, 248, 247, 1),
	                           new RgbaColor(204, 216, 216, 1),
	                           new RgbaColor(164, 188, 190, 1),
	                           new RgbaColor(255, 255, 255, 1)];
	
	                radFCtx.save();
	                radFCtx.arc(centerX, centerY, imageWidth * 0.990654 / 2, 0, TWO_PI, true);
	                radFCtx.clip();
	                outerX = imageWidth * 0.495327;
	                innerX = imageWidth * 0.420560;
	                grad = new ConicalGradient(fractions, colors);
	                grad.fillCircle(radFCtx, centerX, centerY, innerX, outerX);
	                // fade outer edge
	                radFCtx.strokeStyle = '#848484';
	                radFCtx.strokeStyle = 'rgba(132, 132, 132, 0.8)';
	                radFCtx.beginPath();
	                radFCtx.lineWidth = imageWidth / 90;
	                radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true);
	                radFCtx.closePath();
	                radFCtx.stroke();
	                radFCtx.restore();
	
	                break;
	            }
	
	            // inner bright frame
	            radFCtx.fillStyle = 'rgb(191, 191, 191)';
	            radFCtx.beginPath();
	            radFCtx.arc(centerX, centerY, imageWidth * 0.841121 / 2, 0, TWO_PI, true);
	            radFCtx.closePath();
	            radFCtx.fill();
	
	            // clip out center so it is transparent if the background is not visible
	            radFCtx.globalCompositeOperation = 'destination-out';
	            // Background ellipse
	            radFCtx.beginPath();
	            radFCtx.arc(centerX, centerY, imageWidth * 0.83 / 2, 0, TWO_PI, true);
	            radFCtx.closePath();
	            radFCtx.fill();
	
	            // cache the buffer
	            drawRadialFrameImage.cache[cacheKey] = radFBuffer;
	        }
	        ctx.drawImage(drawRadialFrameImage.cache[cacheKey], 0, 0);
	        return this;
	    };
	    drawRadialFrameImage.cache = {};
	
	    var drawLinearFrameImage = function (ctx, frameDesign, imageWidth, imageHeight, vertical) {
	        var frameWidth,
	            linFBuffer, linFCtx,
	            OUTER_FRAME_CORNER_RADIUS,
	            FRAME_MAIN_CORNER_RADIUS,
	            SUBTRACT_CORNER_RADIUS,
	            grad,
	            fractions = [],
	            colors = [],
	            cacheKey = imageWidth.toString() + imageHeight + frameDesign.design + vertical;
	
	        // check if we have already created and cached this buffer, if not create it
	        if (!drawLinearFrameImage.cache[cacheKey]) {
	            frameWidth = Math.sqrt(imageWidth * imageWidth + imageHeight * imageHeight) * 0.04;
	            frameWidth = Math.min(frameWidth, (vertical ? imageWidth : imageHeight) * 0.1);
	
	            // Setup buffer
	            linFBuffer = createBuffer(imageWidth, imageHeight);
	            linFCtx = linFBuffer.getContext('2d');
	
	            // Calculate corner radii
	            if (vertical) {
	                OUTER_FRAME_CORNER_RADIUS = imageWidth * 0.05;
	                FRAME_MAIN_CORNER_RADIUS = OUTER_FRAME_CORNER_RADIUS - 1;
	                SUBTRACT_CORNER_RADIUS = imageWidth * 0.028571;
	            } else {
	                OUTER_FRAME_CORNER_RADIUS = imageHeight * 0.05;
	                FRAME_MAIN_CORNER_RADIUS = OUTER_FRAME_CORNER_RADIUS - 1;
	                SUBTRACT_CORNER_RADIUS = imageHeight * 0.028571;
	            }
	
	            roundedRectangle(linFCtx, 0, 0, imageWidth, imageHeight, OUTER_FRAME_CORNER_RADIUS);
	            linFCtx.fillStyle = '#838383';
	            linFCtx.fill();
	
	            roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, FRAME_MAIN_CORNER_RADIUS);
	
	            // main gradient frame
	            switch (frameDesign.design) {
	            case 'metal':
	                grad = linFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
	                grad.addColorStop(0, '#fefefe');
	                grad.addColorStop(0.07, 'rgb(210, 210, 210)');
	                grad.addColorStop(0.12, 'rgb(179, 179, 179)');
	                grad.addColorStop(1, 'rgb(213, 213, 213)');
	                linFCtx.fillStyle = grad;
	                linFCtx.fill();
	                break;
	
	            case 'brass':
	                grad = linFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
	                grad.addColorStop(0, 'rgb(249, 243, 155)');
	                grad.addColorStop(0.05, 'rgb(246, 226, 101)');
	                grad.addColorStop(0.10, 'rgb(240, 225, 132)');
	                grad.addColorStop(0.50, 'rgb(90, 57, 22)');
	                grad.addColorStop(0.90, 'rgb(249, 237, 139)');
	                grad.addColorStop(0.95, 'rgb(243, 226, 108)');
	                grad.addColorStop(1, 'rgb(202, 182, 113)');
	                linFCtx.fillStyle = grad;
	                linFCtx.fill();
	                break;
	
	            case 'steel':
	                grad = linFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
	                grad.addColorStop(0, 'rgb(231, 237, 237)');
	                grad.addColorStop(0.05, 'rgb(189, 199, 198)');
	                grad.addColorStop(0.10, 'rgb(192, 201, 200)');
	                grad.addColorStop(0.50, 'rgb(23, 31, 33)');
	                grad.addColorStop(0.90, 'rgb(196, 205, 204)');
	                grad.addColorStop(0.95, 'rgb(194, 204, 203)');
	                grad.addColorStop(1, 'rgb(189, 201, 199)');
	                linFCtx.fillStyle = grad;
	                linFCtx.fill();
	                break;
	
	            case 'gold':
	                grad = linFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
	                grad.addColorStop(0, 'rgb(255, 255, 207)');
	                grad.addColorStop(0.15, 'rgb(255, 237, 96)');
	                grad.addColorStop(0.22, 'rgb(254, 199, 57)');
	                grad.addColorStop(0.3, 'rgb(255, 249, 203)');
	                grad.addColorStop(0.38, 'rgb(255, 199, 64)');
	                grad.addColorStop(0.44, 'rgb(252, 194, 60)');
	                grad.addColorStop(0.51, 'rgb(255, 204, 59)');
	                grad.addColorStop(0.6, 'rgb(213, 134, 29)');
	                grad.addColorStop(0.68, 'rgb(255, 201, 56)');
	                grad.addColorStop(0.75, 'rgb(212, 135, 29)');
	                grad.addColorStop(1, 'rgb(247, 238, 101)');
	                linFCtx.fillStyle = grad;
	                linFCtx.fill();
	                break;
	
	            case 'anthracite':
	                grad = linFCtx.createLinearGradient(0, 0.004672 * imageHeight, 0, 0.995326 * imageHeight);
	                grad.addColorStop(0, 'rgb(118, 117, 135)');
	                grad.addColorStop(0.06, 'rgb(74, 74, 82)');
	                grad.addColorStop(0.12, 'rgb(50, 50, 54)');
	                grad.addColorStop(1, 'rgb(79, 79, 87)');
	                linFCtx.fillStyle = grad;
	                linFCtx.fill();
	                break;
	
	            case 'tiltedGray':
	                grad = linFCtx.createLinearGradient(0.233644 * imageWidth, 0.084112 * imageHeight, 0.81258 * imageWidth, 0.910919 * imageHeight);
	                grad.addColorStop(0, '#ffffff');
	                grad.addColorStop(0.07, 'rgb(210, 210, 210)');
	                grad.addColorStop(0.16, 'rgb(179, 179, 179)');
	                grad.addColorStop(0.33, '#ffffff');
	                grad.addColorStop(0.55, '#c5c5c5');
	                grad.addColorStop(0.79, '#ffffff');
	                grad.addColorStop(1, '#666666');
	                linFCtx.fillStyle = grad;
	                linFCtx.fill();
	                break;
	
	            case 'tiltedBlack':
	                grad = linFCtx.createLinearGradient(0.228971 * imageWidth, 0.079439 * imageHeight, 0.802547 * imageWidth, 0.898591 * imageHeight);
	                grad.addColorStop(0, '#666666');
	                grad.addColorStop(0.21, '#000000');
	                grad.addColorStop(0.47, '#666666');
	                grad.addColorStop(0.99, '#000000');
	                grad.addColorStop(1, '#000000');
	                linFCtx.fillStyle = grad;
	                linFCtx.fill();
	                break;
	
	            case 'glossyMetal':
	                // The smaller side is important for the contour gradient
	    // Java version uses a contour gradient for the outer frame rim
	    // but this is only 1 pixel wide, so a plain color fill is essentially
	    // the same.
	    /*
	                var frameMainFractions4 = [
	                                            0,
	                                            (imageWidth >= imageHeight ? 32 / imageHeight : 32 / imageWidth) * 0.04,
	                                            1
	                                            ];
	                var frameMainColors4 = [
	                                        new RgbaColor(244, 244, 244, 1),
	                                        new RgbaColor(207, 207, 207, 1),
	                                        new RgbaColor(207, 207, 207, 1)
	                                        ];
	                var frameMainGradient4 = new contourGradient(linFCtx, 0, 0, imageWidth,  imageHeight, frameMainFractions4, frameMainColors4);
	                // Outer frame rim
	                roundedRectangle(linFCtx, 1, 1, imageWidth-2, imageHeight-2, OUTER_FRAME_CORNER_RADIUS);
	                linFCtx.clip();
	                frameMainGradient4.paintContext();
	    */
	                // Outer frame rim
	    //                roundedRectangle(linFCtx, 1, 1, imageWidth-2, imageHeight-2, OUTER_FRAME_CORNER_RADIUS);
	    //                linFCtx.clip();
	    //                linFCtx.fillStyle = '#cfcfcf';
	    //                linFCtx.fill();
	
	                // Main frame
	    //                roundedRectangle(linFCtx, 2, 2, imageWidth - 4, imageHeight - 4, FRAME_MAIN_CORNER_RADIUS);
	    //                linFCtx.clip();
	                roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, OUTER_FRAME_CORNER_RADIUS);
	                linFCtx.clip();
	                grad = linFCtx.createLinearGradient(0, 1, 0, imageHeight - 2);
	    // The fractions from the Java version of linear gauge
	    /*
	                grad.addColorStop(0, 'rgb(249, 249, 249)');
	                grad.addColorStop(0.1, 'rgb(200, 195, 191)');
	                grad.addColorStop(0.26, '#ffffff');
	                grad.addColorStop(0.73, 'rgb(29, 29, 29)');
	                grad.addColorStop(1, 'rgb(209, 209, 209)');
	    */
	    // Modified fractions from the radial gauge - looks better imho
	                grad.addColorStop(0, 'rgb(249, 249, 249)');
	                grad.addColorStop(0.2, 'rgb(200, 195, 191)');
	                grad.addColorStop(0.3, '#ffffff');
	                grad.addColorStop(0.6, 'rgb(29, 29, 29)');
	                grad.addColorStop(0.8, 'rgb(200, 194, 192)');
	                grad.addColorStop(1, 'rgb(209, 209, 209)');
	                linFCtx.fillStyle = grad;
	                linFCtx.fill();
	
	                // Inner frame bright
	                roundedRectangle(linFCtx, frameWidth - 2, frameWidth - 2, imageWidth - (frameWidth - 2) * 2, imageHeight - (frameWidth - 2) * 2, SUBTRACT_CORNER_RADIUS);
	                linFCtx.clip();
	                linFCtx.fillStyle = '#f6f6f6';
	                linFCtx.fill();
	
	                // Inner frame dark
	                roundedRectangle(linFCtx, frameWidth - 1, frameWidth - 1, imageWidth - (frameWidth - 1) * 2, imageHeight - (frameWidth - 1) * 2, SUBTRACT_CORNER_RADIUS);
	                linFCtx.clip();
	                linFCtx.fillStyle = '#333333';
	                linFCtx.fill();
	                break;
	
	            case 'blackMetal':
	                fractions = [0,
	                             0.125,
	                             0.347222,
	                             0.5,
	                             0.680555,
	                             0.875,
	                             1];
	
	                colors = [ new RgbaColor('#FFFFFF'),
	                           new RgbaColor('#000000'),
	                           new RgbaColor('#999999'),
	                           new RgbaColor('#000000'),
	                           new RgbaColor('#999999'),
	                           new RgbaColor('#000000'),
	                           new RgbaColor('#FFFFFF')];
	                // Set the clip
	                linFCtx.beginPath();
	                roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, OUTER_FRAME_CORNER_RADIUS);
	                linFCtx.closePath();
	                linFCtx.clip();
	                grad = new ConicalGradient(fractions, colors);
	                grad.fillRect(linFCtx, imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, frameWidth, frameWidth);
	                break;
	
	            case 'shinyMetal':
	                fractions = [0,
	                             0.125,
	                             0.25,
	                             0.347222,
	                             0.5,
	                             0.652777,
	                             0.75,
	                             0.875,
	                             1];
	
	                colors = [ new RgbaColor('#FFFFFF'),
	                           new RgbaColor('#D2D2D2'),
	                           new RgbaColor('#B3B3B3'),
	                           new RgbaColor('#EEEEEE'),
	                           new RgbaColor('#A0A0A0'),
	                           new RgbaColor('#EEEEEE'),
	                           new RgbaColor('#B3B3B3'),
	                           new RgbaColor('#D2D2D2'),
	                           new RgbaColor('#FFFFFF')];
	                // Set the clip
	                linFCtx.beginPath();
	                roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, OUTER_FRAME_CORNER_RADIUS);
	                linFCtx.closePath();
	                linFCtx.clip();
	                grad = new ConicalGradient(fractions, colors);
	                grad.fillRect(linFCtx, imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, frameWidth, frameWidth);
	                break;
	
	            case 'chrome':
	                fractions = [0,
	                             0.09,
	                             0.12,
	                             0.16,
	                             0.25,
	                             0.29,
	                             0.33,
	                             0.38,
	                             0.48,
	                             0.52,
	                             0.63,
	                             0.68,
	                             0.8,
	                             0.83,
	                             0.87,
	                             0.97,
	                             1];
	
	                colors = [ new RgbaColor('#FFFFFF'),
	                           new RgbaColor('#FFFFFF'),
	                           new RgbaColor('#888890'),
	                           new RgbaColor('#A4B9BE'),
	                           new RgbaColor('#9EB3B6'),
	                           new RgbaColor('#707070'),
	                           new RgbaColor('#DDE3E3'),
	                           new RgbaColor('#9BB0B3'),
	                           new RgbaColor('#9CB0B1'),
	                           new RgbaColor('#FEFFFF'),
	                           new RgbaColor('#FFFFFF'),
	                           new RgbaColor('#9CB4B4'),
	                           new RgbaColor('#C6D1D3'),
	                           new RgbaColor('#F6F8F7'),
	                           new RgbaColor('#CCD8D8'),
	                           new RgbaColor('#A4BCBE'),
	                           new RgbaColor('#FFFFFF')];
	                // Set the clip
	                linFCtx.beginPath();
	                roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, OUTER_FRAME_CORNER_RADIUS);
	                linFCtx.closePath();
	                linFCtx.clip();
	                grad = new ConicalGradient(fractions, colors);
	                grad.fillRect(linFCtx, imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, frameWidth, frameWidth);
	                break;
	            }
	
	            roundedRectangle(linFCtx, frameWidth - 1, frameWidth - 1, imageWidth - (frameWidth - 1) * 2, imageHeight - (frameWidth - 1) * 2, SUBTRACT_CORNER_RADIUS - 1);
	            linFCtx.fillStyle = 'rgb(192, 192, 192)';
	
	            // clip out the center of the frame for transparent backgrounds
	            linFCtx.globalCompositeOperation = 'destination-out';
	            roundedRectangle(linFCtx, frameWidth, frameWidth, imageWidth - frameWidth * 2, imageHeight - frameWidth * 2, 4);
	            linFCtx.fill();
	
	            // cache the buffer
	            drawLinearFrameImage.cache[cacheKey] = linFBuffer;
	        }
	        ctx.drawImage(drawLinearFrameImage.cache[cacheKey], 0, 0);
	        return this;
	    };
	    drawLinearFrameImage.cache = {};
	
	    var drawRadialBackgroundImage = function (ctx, backgroundColor, centerX, centerY, imageWidth, imageHeight) {
	        var radBBuffer, radBCtx,
	            grad, fractions, colors,
	            backgroundOffsetX = imageWidth * 0.831775 / 2,
	            mono, textureColor, texture,
	            radius, turnRadius, stepSize,
	            end, i,
	            cacheKey = imageWidth.toString() + imageHeight + backgroundColor.name;
	
	        // check if we have already created and cached this buffer, if not create it
	        if (!drawRadialBackgroundImage.cache[cacheKey]) {
	            // Setup buffer
	            radBBuffer = createBuffer(imageWidth, imageHeight);
	            radBCtx = radBBuffer.getContext('2d');
	
	            // Background ellipse
	            radBCtx.beginPath();
	            radBCtx.arc(centerX, centerY, backgroundOffsetX, 0, TWO_PI, true);
	            radBCtx.closePath();
	
	            // If the backgroundColor is a texture fill it with the texture instead of the gradient
	            if (backgroundColor.name === 'CARBON' || backgroundColor.name === 'PUNCHED_SHEET' ||
	                backgroundColor.name === 'BRUSHED_METAL' || backgroundColor.name === 'BRUSHED_STAINLESS') {
	
	                if (backgroundColor.name === 'CARBON') {
	                    radBCtx.fillStyle = radBCtx.createPattern(carbonBuffer, 'repeat');
	                    radBCtx.fill();
	                }
	
	                if (backgroundColor.name === 'PUNCHED_SHEET') {
	                    radBCtx.fillStyle = radBCtx.createPattern(punchedSheetBuffer, 'repeat');
	                    radBCtx.fill();
	                }
	
	                // Add another inner shadow to make the look more realistic
	                grad = radBCtx.createLinearGradient(backgroundOffsetX, 0, imageWidth - backgroundOffsetX, 0);
	                grad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
	                grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
	                grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
	                radBCtx.fillStyle = grad;
	                radBCtx.beginPath();
	                radBCtx.arc(centerX, centerY, backgroundOffsetX, 0, TWO_PI, true);
	                radBCtx.closePath();
	                radBCtx.fill();
	
	                if (backgroundColor.name === 'BRUSHED_METAL' || backgroundColor.name === 'BRUSHED_STAINLESS') {
	                    mono = (backgroundColor.name === 'BRUSHED_METAL' ? true : false);
	                    textureColor = parseInt(backgroundColor.gradientStop.getHexColor().substr(-6), 16);
	                    texture = brushedMetalTexture(textureColor, 5, 0.1, mono, 0.5);
	                    radBCtx.fillStyle = radBCtx.createPattern(texture.fill(0, 0, imageWidth, imageHeight), 'no-repeat');
	                    radBCtx.fill();
	                }
	            } else if (backgroundColor.name === 'STAINLESS' || backgroundColor.name === 'TURNED') {
	                // Define the fractions of the conical gradient paint
	                fractions = [0,
	                             0.03,
	                             0.10,
	                             0.14,
	                             0.24,
	                             0.33,
	                             0.38,
	                             0.5,
	                             0.62,
	                             0.67,
	                             0.76,
	                             0.81,
	                             0.85,
	                             0.97,
	                             1];
	
	                // Define the colors of the conical gradient paint
	                colors = [new RgbaColor('#FDFDFD'),
	                          new RgbaColor('#FDFDFD'),
	                          new RgbaColor('#B2B2B4'),
	                          new RgbaColor('#ACACAE'),
	                          new RgbaColor('#FDFDFD'),
	                          new RgbaColor('#8E8E8E'),
	                          new RgbaColor('#8E8E8E'),
	                          new RgbaColor('#FDFDFD'),
	                          new RgbaColor('#8E8E8E'),
	                          new RgbaColor('#8E8E8E'),
	                          new RgbaColor('#FDFDFD'),
	                          new RgbaColor('#ACACAE'),
	                          new RgbaColor('#B2B2B4'),
	                          new RgbaColor('#FDFDFD'),
	                          new RgbaColor('#FDFDFD')];
	
	                grad = new ConicalGradient(fractions, colors);
	                grad.fillCircle(radBCtx, centerX, centerY, 0, backgroundOffsetX);
	
	                if (backgroundColor.name === 'TURNED') {
	                    // Define the turning radius
	                    radius = backgroundOffsetX;
	                    turnRadius = radius * 0.55;
	                    // Step size proporational to radius
	                    stepSize = RAD_FACTOR * (500 / radius);
	                    // Save before we start
	                    radBCtx.save();
	                    // restrict the turnings to the desired area
	                    radBCtx.beginPath();
	                    radBCtx.arc(centerX, centerY, radius, 0, TWO_PI);
	                    radBCtx.closePath();
	                    radBCtx.clip();
	                    // set the style for the turnings
	                    radBCtx.lineWidth = 0.5;
	                    end = TWO_PI - stepSize * 0.3;
	                    // Step the engine round'n'round
	                    for (i = 0 ; i < end; i += stepSize) {
	                        // draw a 'turn'
	                        radBCtx.strokeStyle = 'rgba(240, 240, 255, 0.25)';
	                        radBCtx.beginPath();
	                        radBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
	                        radBCtx.stroke();
	                        // rotate the 'piece' a fraction to draw 'shadow'
	                        radBCtx.translate(centerX, centerY);
	                        radBCtx.rotate(stepSize * 0.3);
	                        radBCtx.translate(-centerX, -centerY);
	                        // draw a 'turn'
	                        radBCtx.strokeStyle = 'rgba(25, 10, 10, 0.1)';
	                        radBCtx.beginPath();
	                        radBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
	                        radBCtx.stroke();
	                        // now rotate on to the next 'scribe' position minus the 'fraction'
	                        radBCtx.translate(centerX, centerY);
	                        radBCtx.rotate(stepSize - stepSize * 0.3);
	                        radBCtx.translate(-centerX, -centerY);
	                    }
	                    // Restore canvas now we are done
	                    radBCtx.restore();
	                }
	            } else {
	                grad = radBCtx.createLinearGradient(0, imageWidth * 0.084112, 0, backgroundOffsetX * 2);
	                grad.addColorStop(0, backgroundColor.gradientStart.getRgbaColor());
	                grad.addColorStop(0.4, backgroundColor.gradientFraction.getRgbaColor());
	                grad.addColorStop(1, backgroundColor.gradientStop.getRgbaColor());
	                radBCtx.fillStyle = grad;
	                radBCtx.fill();
	            }
	            // Inner shadow
	            grad = radBCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, backgroundOffsetX);
	            grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
	            grad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
	            grad.addColorStop(0.71, 'rgba(0, 0, 0, 0)');
	            grad.addColorStop(0.86, 'rgba(0, 0, 0, 0.03)');
	            grad.addColorStop(0.92, 'rgba(0, 0, 0, 0.07)');
	            grad.addColorStop(0.97, 'rgba(0, 0, 0, 0.15)');
	            grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
	            radBCtx.fillStyle = grad;
	
	            radBCtx.beginPath();
	            radBCtx.arc(centerX, centerY, backgroundOffsetX, 0, TWO_PI, true);
	            radBCtx.closePath();
	            radBCtx.fill();
	
	            // cache the buffer
	            drawRadialBackgroundImage.cache[cacheKey] = radBBuffer;
	        }
	        ctx.drawImage(drawRadialBackgroundImage.cache[cacheKey], 0, 0);
	        return this;
	    };
	    drawRadialBackgroundImage.cache = {};
	
	    var drawRadialCustomImage = function (ctx, img, centerX, centerY, imageWidth, imageHeight) {
	        var drawWidth = imageWidth * 0.831775,
	            drawHeight = imageHeight * 0.831775,
	            x = (imageWidth - drawWidth) / 2,
	            y = (imageHeight - drawHeight) / 2;
	
	        if (img !== null && img.height > 0 && img.width > 0) {
	            ctx.save();
	            // Set the clipping area
	            ctx.beginPath();
	            ctx.arc(centerX, centerY, imageWidth * 0.831775 / 2, 0, TWO_PI, true);
	            ctx.clip();
	            // Add the image
	            ctx.drawImage(img, x, y, drawWidth, drawHeight);
	            ctx.restore();
	        }
	        return this;
	    };
	
	    var drawLinearBackgroundImage = function (ctx, backgroundColor, imageWidth, imageHeight, vertical) {
	        var i, end, grad, fractions, colors,
	            frameWidth,
	            linBBuffer, linBCtx, linBColor,
	            radius,
	            turnRadius, centerX, centerY, stepSize,
	            mono, textureColor, texture,
	            cacheKey = imageWidth.toString() + imageHeight + vertical + backgroundColor.name;
	
	        // check if we have already created and cached this buffer, if not create it
	        if (!drawLinearBackgroundImage.cache[cacheKey]) {
	            frameWidth = Math.sqrt(imageWidth * imageWidth + imageHeight * imageHeight) * 0.04;
	            frameWidth = Math.min(frameWidth, (vertical ? imageWidth : imageHeight) * 0.1);
	
	            // Setup buffer
	            linBBuffer = createBuffer(imageWidth, imageHeight);
	            linBCtx = linBBuffer.getContext('2d');
	            linBColor = backgroundColor;
	
	            roundedRectangle(linBCtx, frameWidth, frameWidth, imageWidth - frameWidth * 2, imageHeight - frameWidth * 2, 4);
	
	            // If the backgroundColor is a texture fill it with the texture instead of the gradient
	            if (backgroundColor.name === 'CARBON' || backgroundColor.name === 'PUNCHED_SHEET' ||
	                backgroundColor.name === 'STAINLESS' || backgroundColor.name === 'BRUSHED_METAL' ||
	                backgroundColor.name === 'BRUSHED_STAINLESS' || backgroundColor.name === 'TURNED') {
	                if (backgroundColor.name === 'CARBON') {
	                    linBCtx.fillStyle = linBCtx.createPattern(carbonBuffer, 'repeat');
	                    linBCtx.fill();
	                }
	
	                if (backgroundColor.name === 'PUNCHED_SHEET') {
	                    linBCtx.fillStyle = linBCtx.createPattern(punchedSheetBuffer, 'repeat');
	                    linBCtx.fill();
	                }
	
	                if (backgroundColor.name === 'STAINLESS' || backgroundColor.name === 'TURNED') {
	                    // Define the fraction of the conical gradient paint
	                    fractions = [0,
	                                 0.03,
	                                 0.10,
	                                 0.14,
	                                 0.24,
	                                 0.33,
	                                 0.38,
	                                 0.5,
	                                 0.62,
	                                 0.67,
	                                 0.76,
	                                 0.81,
	                                 0.85,
	                                 0.97,
	                                 1];
	
	                    // Define the colors of the conical gradient paint
	                    colors = [new RgbaColor('#FDFDFD'),
	                              new RgbaColor('#FDFDFD'),
	                              new RgbaColor('#B2B2B4'),
	                              new RgbaColor('#ACACAE'),
	                              new RgbaColor('#FDFDFD'),
	                              new RgbaColor('#8E8E8E'),
	                              new RgbaColor('#8E8E8E'),
	                              new RgbaColor('#FDFDFD'),
	                              new RgbaColor('#8E8E8E'),
	                              new RgbaColor('#8E8E8E'),
	                              new RgbaColor('#FDFDFD'),
	                              new RgbaColor('#ACACAE'),
	                              new RgbaColor('#B2B2B4'),
	                              new RgbaColor('#FDFDFD'),
	                              new RgbaColor('#FDFDFD')];
	                    grad = new ConicalGradient(fractions, colors);
	                    // Set a clip as we will be drawing outside the required area
	                    roundedRectangle(linBCtx, frameWidth, frameWidth, imageWidth - frameWidth * 2, imageHeight - frameWidth * 2, 4);
	                    linBCtx.clip();
	                    grad.fillRect(linBCtx, imageWidth / 2, imageHeight / 2, imageWidth - frameWidth * 2, imageHeight - frameWidth * 2, imageWidth / 2, imageHeight / 2);
	                    // Add an additional inner shadow to fade out brightness at the top
	                    grad = linBCtx.createLinearGradient(0, frameWidth, 0, imageHeight - frameWidth * 2);
	                    grad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
	                    grad.addColorStop(0.1, 'rgba(0, 0, 0, 0.05)');
	                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
	                    linBCtx.fillStyle = grad;
	                    roundedRectangle(linBCtx, frameWidth, frameWidth, imageWidth - frameWidth * 2, imageHeight - frameWidth * 2, 4);
	                    linBCtx.fill();
	                    linBCtx.restore();
	
	                    if (backgroundColor.name === 'TURNED') {
	                        // Define the turning radius
	                        radius = Math.sqrt((imageWidth - frameWidth * 2) * (imageWidth - frameWidth * 2) + (imageHeight - frameWidth * 2) * (imageHeight - frameWidth * 2)) / 2;
	                        turnRadius = radius * 0.55;
	                        centerX = imageWidth / 2;
	                        centerY = imageHeight / 2;
	                        // Step size proporational to radius
	                        stepSize = TWO_PI / 360 * (400 / radius);
	
	                        // Save before we start
	                        linBCtx.save();
	
	                        // Set a clip as we will be drawing outside the required area
	                        linBCtx.beginPath();
	                        roundedRectangle(linBCtx, frameWidth, frameWidth, imageWidth - frameWidth * 2, imageHeight - frameWidth * 2, 4);
	                        linBCtx.clip();
	
	                        // set the style for the turnings
	                        linBCtx.lineWidth = 0.5;
	                        end = TWO_PI - stepSize * 0.3;
	                        // Step the engine round'n'round
	                        for (i = 0; i < end; i += stepSize) {
	                            // draw a 'turn'
	                            linBCtx.strokeStyle = 'rgba(240, 240, 255, 0.25)';
	                            linBCtx.beginPath();
	                            linBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
	                            linBCtx.stroke();
	                            // rotate the 'piece'
	                            linBCtx.translate(centerX, centerY);
	                            linBCtx.rotate(stepSize * 0.3);
	                            linBCtx.translate(-centerX, -centerY);
	                            // draw a 'turn'
	                            linBCtx.strokeStyle = 'rgba(25, 10, 10, 0.1)';
	                            linBCtx.beginPath();
	                            linBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
	                            linBCtx.stroke();
	                            linBCtx.translate(centerX, centerY);
	                            linBCtx.rotate(-stepSize * 0.3);
	                            linBCtx.translate(-centerX, -centerY);
	
	                            // rotate the 'piece'
	                            linBCtx.translate(centerX, centerY);
	                            linBCtx.rotate(stepSize);
	                            linBCtx.translate(-centerX, -centerY);
	                        }
	                        // Restore canvas now we are done
	                        linBCtx.restore();
	                    }
	                }
	                // Add an additional inner shadow to make the look more realistic
	                grad = linBCtx.createLinearGradient(frameWidth, frameWidth, imageWidth - frameWidth * 2, imageHeight - frameWidth * 2);
	                grad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
	                grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
	                grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
	                linBCtx.fillStyle = grad;
	                roundedRectangle(linBCtx, frameWidth, frameWidth, imageWidth - frameWidth * 2, imageHeight - frameWidth * 2, 4);
	                linBCtx.fill();
	
	                if (backgroundColor.name === 'BRUSHED_METAL' || backgroundColor.name === 'BRUSHED_STAINLESS') {
	                    mono = (backgroundColor.name === 'BRUSHED_METAL' ? true : false);
	                    textureColor = parseInt(backgroundColor.gradientStop.getHexColor().substr(-6), 16);
	                    texture = brushedMetalTexture(textureColor, 5, 0.1, mono, 0.5);
	                    linBCtx.fillStyle = linBCtx.createPattern(texture.fill(0, 0, imageWidth, imageHeight), 'no-repeat');
	                    linBCtx.fill();
	                }
	            } else {
	                grad = linBCtx.createLinearGradient(0, frameWidth, 0, imageHeight - frameWidth * 2);
	                grad.addColorStop(0, backgroundColor.gradientStart.getRgbaColor());
	                grad.addColorStop(0.4, backgroundColor.gradientFraction.getRgbaColor());
	                grad.addColorStop(1, backgroundColor.gradientStop.getRgbaColor());
	                linBCtx.fillStyle = grad;
	                linBCtx.fill();
	            }
	            // Add a simple inner shadow
	            colors = [ 'rgba(0, 0, 0, 0.3)',
	                       'rgba(0, 0, 0, 0.15)',
	                       'rgba(0, 0, 0, 0.07)',
	                       'rgba(0, 0, 0, 0.03)',
	                       'rgba(0, 0, 0, 0)',
	                       'rgba(0, 0, 0, 0)',
	                       'rgba(0, 0, 0, 0)'
	                     ];
	
	            for (i = 0 ; i < 7 ; i++) {
	                roundedRectangle(linBCtx, frameWidth + i, frameWidth + i, imageWidth - frameWidth * 2 - (2 * i), imageHeight - frameWidth * 2 - (2 * i), 4);
	                linBCtx.strokeStyle = colors[i];
	                linBCtx.stroke();
	            }
	            // cache the buffer
	            drawLinearBackgroundImage.cache[cacheKey] = linBBuffer;
	        }
	        ctx.drawImage(drawLinearBackgroundImage.cache[cacheKey], 0, 0);
	        return this;
	    };
	    drawLinearBackgroundImage.cache = {};
	
	    var drawRadialForegroundImage = function (ctx, foregroundType, imageWidth, imageHeight, withCenterKnob, knob, style, gaugeType, orientation) {
	        var radFgBuffer, radFgCtx,
	            knobSize = Math.ceil(imageHeight * 0.084112),
	            knobX = imageWidth * 0.5 - knobSize / 2,
	            knobY = imageHeight * 0.5 - knobSize / 2,
	            shadowOffset = imageWidth * 0.008,
	            gradHighlight, gradHighlight2,
	            cacheKey = foregroundType.type + imageWidth + imageHeight + withCenterKnob + (knob !== undefined ? knob.type : '-') +
	                       (style !== undefined ? style.style : '-') + (orientation !== undefined ? orientation.type : '-');
	
	        // check if we have already created and cached this buffer, if so return it and exit
	        if (!drawRadialForegroundImage.cache[cacheKey]) {
	            // Setup buffer
	            radFgBuffer = createBuffer(imageWidth, imageHeight);
	            radFgCtx = radFgBuffer.getContext('2d');
	
	            // center post
	            if (withCenterKnob) {
	                // Set the pointer shadow params
	                radFgCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
	                radFgCtx.shadowOffsetX = radFgCtx.shadowOffsetY = shadowOffset;
	                radFgCtx.shadowBlur = shadowOffset * 2;
	
	                if (gaugeType === steelseries.GaugeType.TYPE5) {
	                    if (steelseries.Orientation.WEST === orientation) {
	                        knobX = imageWidth * 0.733644 - knobSize / 2;
	                        radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, knobY);
	                    } else if (steelseries.Orientation.EAST === orientation) {
	                        knobX = imageWidth * (1 - 0.733644) - knobSize / 2;
	                        radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, knobY);
	                    } else {
	                        knobY = imageHeight * 0.733644 - knobSize / 2;
	                        radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, imageHeight * 0.6857);
	                    }
	                } else {
	                    radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, knobY);
	                }
	                // Undo shadow drawing
	                radFgCtx.shadowOffsetX = radFgCtx.shadowOffsetY = 0;
	                radFgCtx.shadowBlur = 0;
	            }
	
	            // highlight
	            switch (foregroundType.type) {
	            case 'type2':
	                radFgCtx.beginPath();
	                radFgCtx.moveTo(imageWidth * 0.135514, imageHeight * 0.696261);
	                radFgCtx.bezierCurveTo(imageWidth * 0.214953, imageHeight * 0.588785, imageWidth * 0.317757, imageHeight * 0.5, imageWidth * 0.462616, imageHeight * 0.425233);
	                radFgCtx.bezierCurveTo(imageWidth * 0.612149, imageHeight * 0.345794, imageWidth * 0.733644, imageHeight * 0.317757, imageWidth * 0.873831, imageHeight * 0.322429);
	                radFgCtx.bezierCurveTo(imageWidth * 0.766355, imageHeight * 0.112149, imageWidth * 0.528037, imageHeight * 0.023364, imageWidth * 0.313084, imageHeight * 0.130841);
	                radFgCtx.bezierCurveTo(imageWidth * 0.098130, imageHeight * 0.238317, imageWidth * 0.028037, imageHeight * 0.485981, imageWidth * 0.135514, imageHeight * 0.696261);
	                radFgCtx.closePath();
	                gradHighlight = radFgCtx.createLinearGradient(0.313084 * imageWidth, 0.135514 * imageHeight, 0.495528 * imageWidth, 0.493582 * imageHeight);
	                gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
	                gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
	                break;
	
	            case 'type3':
	                radFgCtx.beginPath();
	                radFgCtx.moveTo(imageWidth * 0.084112, imageHeight * 0.509345);
	                radFgCtx.bezierCurveTo(imageWidth * 0.210280, imageHeight * 0.556074, imageWidth * 0.462616, imageHeight * 0.560747, imageWidth * 0.5, imageHeight * 0.560747);
	                radFgCtx.bezierCurveTo(imageWidth * 0.537383, imageHeight * 0.560747, imageWidth * 0.794392, imageHeight * 0.560747, imageWidth * 0.915887, imageHeight * 0.509345);
	                radFgCtx.bezierCurveTo(imageWidth * 0.915887, imageHeight * 0.275700, imageWidth * 0.738317, imageHeight * 0.084112, imageWidth * 0.5, imageHeight * 0.084112);
	                radFgCtx.bezierCurveTo(imageWidth * 0.261682, imageHeight * 0.084112, imageWidth * 0.084112, imageHeight * 0.275700, imageWidth * 0.084112, imageHeight * 0.509345);
	                radFgCtx.closePath();
	                gradHighlight = radFgCtx.createLinearGradient(0, 0.093457 * imageHeight, 0, 0.556073 * imageHeight);
	                gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
	                gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
	                break;
	
	            case 'type4':
	                radFgCtx.beginPath();
	                radFgCtx.moveTo(imageWidth * 0.677570, imageHeight * 0.242990);
	                radFgCtx.bezierCurveTo(imageWidth * 0.771028, imageHeight * 0.308411, imageWidth * 0.822429, imageHeight * 0.411214, imageWidth * 0.813084, imageHeight * 0.528037);
	                radFgCtx.bezierCurveTo(imageWidth * 0.799065, imageHeight * 0.654205, imageWidth * 0.719626, imageHeight * 0.757009, imageWidth * 0.593457, imageHeight * 0.799065);
	                radFgCtx.bezierCurveTo(imageWidth * 0.485981, imageHeight * 0.831775, imageWidth * 0.369158, imageHeight * 0.808411, imageWidth * 0.285046, imageHeight * 0.728971);
	                radFgCtx.bezierCurveTo(imageWidth * 0.275700, imageHeight * 0.719626, imageWidth * 0.252336, imageHeight * 0.714953, imageWidth * 0.233644, imageHeight * 0.728971);
	                radFgCtx.bezierCurveTo(imageWidth * 0.214953, imageHeight * 0.747663, imageWidth * 0.219626, imageHeight * 0.771028, imageWidth * 0.228971, imageHeight * 0.775700);
	                radFgCtx.bezierCurveTo(imageWidth * 0.331775, imageHeight * 0.878504, imageWidth * 0.476635, imageHeight * 0.915887, imageWidth * 0.616822, imageHeight * 0.869158);
	                radFgCtx.bezierCurveTo(imageWidth * 0.771028, imageHeight * 0.822429, imageWidth * 0.873831, imageHeight * 0.691588, imageWidth * 0.887850, imageHeight * 0.532710);
	                radFgCtx.bezierCurveTo(imageWidth * 0.897196, imageHeight * 0.387850, imageWidth * 0.836448, imageHeight * 0.257009, imageWidth * 0.719626, imageHeight * 0.182242);
	                radFgCtx.bezierCurveTo(imageWidth * 0.705607, imageHeight * 0.172897, imageWidth * 0.682242, imageHeight * 0.163551, imageWidth * 0.663551, imageHeight * 0.186915);
	                radFgCtx.bezierCurveTo(imageWidth * 0.654205, imageHeight * 0.205607, imageWidth * 0.668224, imageHeight * 0.238317, imageWidth * 0.677570, imageHeight * 0.242990);
	                radFgCtx.closePath();
	                gradHighlight = radFgCtx.createRadialGradient((0.5) * imageWidth, ((0.5) * imageHeight), 0, ((0.5) * imageWidth), ((0.5) * imageHeight), 0.387850 * imageWidth);
	                gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0)');
	                gradHighlight.addColorStop(0.82, 'rgba(255, 255, 255, 0)');
	                gradHighlight.addColorStop(0.83, 'rgba(255, 255, 255, 0)');
	                gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
	
	                radFgCtx.beginPath();
	                radFgCtx.moveTo(imageWidth * 0.261682, imageHeight * 0.224299);
	                radFgCtx.bezierCurveTo(imageWidth * 0.285046, imageHeight * 0.238317, imageWidth * 0.252336, imageHeight * 0.285046, imageWidth * 0.242990, imageHeight * 0.317757);
	                radFgCtx.bezierCurveTo(imageWidth * 0.242990, imageHeight * 0.350467, imageWidth * 0.271028, imageHeight * 0.383177, imageWidth * 0.271028, imageHeight * 0.397196);
	                radFgCtx.bezierCurveTo(imageWidth * 0.275700, imageHeight * 0.415887, imageWidth * 0.261682, imageHeight * 0.457943, imageWidth * 0.238317, imageHeight * 0.509345);
	                radFgCtx.bezierCurveTo(imageWidth * 0.224299, imageHeight * 0.542056, imageWidth * 0.177570, imageHeight * 0.612149, imageWidth * 0.158878, imageHeight * 0.612149);
	                radFgCtx.bezierCurveTo(imageWidth * 0.144859, imageHeight * 0.612149, imageWidth * 0.088785, imageHeight * 0.546728, imageWidth * 0.130841, imageHeight * 0.369158);
	                radFgCtx.bezierCurveTo(imageWidth * 0.140186, imageHeight * 0.336448, imageWidth * 0.214953, imageHeight * 0.200934, imageWidth * 0.261682, imageHeight * 0.224299);
	                radFgCtx.closePath();
	                gradHighlight2 = radFgCtx.createLinearGradient(0.130841 * imageWidth, 0.369158 * imageHeight, 0.273839 * imageWidth, 0.412877 * imageHeight);
	                gradHighlight2.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
	                gradHighlight2.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
	                radFgCtx.fillStyle = gradHighlight2;
	                radFgCtx.fill();
	                break;
	
	            case 'type5':
	                radFgCtx.beginPath();
	                radFgCtx.moveTo(imageWidth * 0.084112, imageHeight * 0.5);
	                radFgCtx.bezierCurveTo(imageWidth * 0.084112, imageHeight * 0.271028, imageWidth * 0.271028, imageHeight * 0.084112, imageWidth * 0.5, imageHeight * 0.084112);
	                radFgCtx.bezierCurveTo(imageWidth * 0.700934, imageHeight * 0.084112, imageWidth * 0.864485, imageHeight * 0.224299, imageWidth * 0.906542, imageHeight * 0.411214);
	                radFgCtx.bezierCurveTo(imageWidth * 0.911214, imageHeight * 0.439252, imageWidth * 0.911214, imageHeight * 0.518691, imageWidth * 0.845794, imageHeight * 0.537383);
	                radFgCtx.bezierCurveTo(imageWidth * 0.794392, imageHeight * 0.546728, imageWidth * 0.551401, imageHeight * 0.411214, imageWidth * 0.392523, imageHeight * 0.457943);
	                radFgCtx.bezierCurveTo(imageWidth * 0.168224, imageHeight * 0.509345, imageWidth * 0.135514, imageHeight * 0.775700, imageWidth * 0.093457, imageHeight * 0.593457);
	                radFgCtx.bezierCurveTo(imageWidth * 0.088785, imageHeight * 0.560747, imageWidth * 0.084112, imageHeight * 0.532710, imageWidth * 0.084112, imageHeight * 0.5);
	                radFgCtx.closePath();
	                gradHighlight = radFgCtx.createLinearGradient(0, 0.084112 * imageHeight, 0, 0.644859 * imageHeight);
	                gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
	                gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
	                break;
	
	            case 'type1':
	            /* falls through */
	            default:
	                radFgCtx.beginPath();
	                radFgCtx.moveTo(imageWidth * 0.084112, imageHeight * 0.509345);
	                radFgCtx.bezierCurveTo(imageWidth * 0.205607, imageHeight * 0.448598, imageWidth * 0.336448, imageHeight * 0.415887, imageWidth * 0.5, imageHeight * 0.415887);
	                radFgCtx.bezierCurveTo(imageWidth * 0.672897, imageHeight * 0.415887, imageWidth * 0.789719, imageHeight * 0.443925, imageWidth * 0.915887, imageHeight * 0.509345);
	                radFgCtx.bezierCurveTo(imageWidth * 0.915887, imageHeight * 0.275700, imageWidth * 0.738317, imageHeight * 0.084112, imageWidth * 0.5, imageHeight * 0.084112);
	                radFgCtx.bezierCurveTo(imageWidth * 0.261682, imageHeight * 0.084112, imageWidth * 0.084112, imageHeight * 0.275700, imageWidth * 0.084112, imageHeight * 0.509345);
	                radFgCtx.closePath();
	                gradHighlight = radFgCtx.createLinearGradient(0, 0.088785 * imageHeight, 0, 0.490654 * imageHeight);
	                gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
	                gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
	                break;
	            }
	            radFgCtx.fillStyle = gradHighlight;
	            radFgCtx.fill();
	
	            // cache the buffer
	            drawRadialForegroundImage.cache[cacheKey] = radFgBuffer;
	        }
	        ctx.drawImage(drawRadialForegroundImage.cache[cacheKey], 0, 0);
	        return this;
	    };
	    drawRadialForegroundImage.cache = {};
	
	    var drawLinearForegroundImage = function (ctx, imageWidth, imageHeight, vertical) {
	        var linFgBuffer, linFgCtx,
	            foregroundGradient,
	            frameWidth, fgOffset, fgOffset2,
	            cacheKey = imageWidth.toString() + imageHeight + vertical;
	
	        // check if we have already created and cached this buffer, if not create it
	        if (!drawLinearForegroundImage.cache[cacheKey]) {
	            // Setup buffer
	            linFgBuffer = createBuffer(imageWidth, imageHeight);
	            linFgCtx = linFgBuffer.getContext('2d');
	
	            frameWidth = Math.sqrt(imageWidth * imageWidth + imageHeight * imageHeight) * 0.04;
	            frameWidth = Math.min(frameWidth, (vertical ? imageWidth : imageHeight) * 0.1);
	            fgOffset = frameWidth * 1.3;
	            fgOffset2 = fgOffset * 1.33;
	
	            linFgCtx.beginPath();
	            linFgCtx.moveTo(fgOffset, imageHeight - fgOffset);
	            linFgCtx.lineTo(imageWidth - fgOffset, imageHeight - fgOffset);
	            linFgCtx.bezierCurveTo(imageWidth - fgOffset, imageHeight - fgOffset, imageWidth - fgOffset2, imageHeight * 0.7, imageWidth - fgOffset2, imageHeight * 0.5);
	            linFgCtx.bezierCurveTo(imageWidth - fgOffset2, fgOffset2, imageWidth - fgOffset, fgOffset, imageWidth - frameWidth, fgOffset);
	            linFgCtx.lineTo(fgOffset, fgOffset);
	            linFgCtx.bezierCurveTo(fgOffset, fgOffset, fgOffset2, imageHeight * 0.285714, fgOffset2, imageHeight * 0.5);
	            linFgCtx.bezierCurveTo(fgOffset2, imageHeight * 0.7, fgOffset, imageHeight - fgOffset, frameWidth, imageHeight - fgOffset);
	            linFgCtx.closePath();
	
	            foregroundGradient = linFgCtx.createLinearGradient(0, (imageHeight - frameWidth), 0, frameWidth);
	            foregroundGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
	            foregroundGradient.addColorStop(0.06, 'rgba(255, 255, 255, 0)');
	            foregroundGradient.addColorStop(0.07, 'rgba(255, 255, 255, 0)');
	            foregroundGradient.addColorStop(0.12, 'rgba(255, 255, 255, 0)');
	            foregroundGradient.addColorStop(0.17, 'rgba(255, 255, 255, 0.013546)');
	            foregroundGradient.addColorStop(0.1701, 'rgba(255, 255, 255, 0)');
	            foregroundGradient.addColorStop(0.79, 'rgba(255, 255, 255, 0)');
	            foregroundGradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
	            foregroundGradient.addColorStop(0.84, 'rgba(255, 255, 255, 0.082217)');
	            foregroundGradient.addColorStop(0.93, 'rgba(255, 255, 255, 0.288702)');
	            foregroundGradient.addColorStop(0.94, 'rgba(255, 255, 255, 0.298039)');
	            foregroundGradient.addColorStop(0.96, 'rgba(255, 255, 255, 0.119213)');
	            foregroundGradient.addColorStop(0.97, 'rgba(255, 255, 255, 0)');
	            foregroundGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
	            linFgCtx.fillStyle = foregroundGradient;
	            linFgCtx.fill();
	
	            // cache the buffer
	            drawLinearForegroundImage.cache[cacheKey] = linFgBuffer;
	        }
	        ctx.drawImage(drawLinearForegroundImage.cache[cacheKey], 0, 0);
	        return this;
	    };
	    drawLinearForegroundImage.cache = {};
	
	    var createKnobImage = function (size, knob, style) {
	        var knobBuffer, knobCtx,
	            maxPostCenterX = size / 2,
	            maxPostCenterY = size / 2,
	            grad,
	            cacheKey = size.toString() + knob.type + style.style;
	
	        // check if we have already created and cached this buffer, if not create it
	        if (!createKnobImage.cache[cacheKey]) {
	            knobBuffer = createBuffer(size * 1.18889, size * 1.18889);
	            knobCtx = knobBuffer.getContext('2d');
	
	            switch (knob.type) {
	            case 'metalKnob':
	                // METALKNOB_FRAME
	                knobCtx.beginPath();
	                knobCtx.moveTo(0, size * 0.5);
	                knobCtx.bezierCurveTo(0, size * 0.222222, size * 0.222222, 0, size * 0.5, 0);
	                knobCtx.bezierCurveTo(size * 0.777777, 0, size, size * 0.222222, size, size * 0.5);
	                knobCtx.bezierCurveTo(size, size * 0.777777, size * 0.777777, size, size * 0.5, size);
	                knobCtx.bezierCurveTo(size * 0.222222, size, 0, size * 0.777777, 0, size * 0.5);
	                knobCtx.closePath();
	                grad = knobCtx.createLinearGradient(0, 0, 0, size);
	                grad.addColorStop(0, 'rgb(92, 95, 101)');
	                grad.addColorStop(0.47, 'rgb(46, 49, 53)');
	                grad.addColorStop(1, 'rgb(22, 23, 26)');
	                knobCtx.fillStyle = grad;
	                knobCtx.fill();
	
	                // METALKNOB_MAIN
	                knobCtx.beginPath();
	                knobCtx.moveTo(size * 0.055555, size * 0.5);
	                knobCtx.bezierCurveTo(size * 0.055555, size * 0.277777, size * 0.277777, size * 0.055555, size * 0.5, size * 0.055555);
	                knobCtx.bezierCurveTo(size * 0.722222, size * 0.055555, size * 0.944444, size * 0.277777, size * 0.944444, size * 0.5);
	                knobCtx.bezierCurveTo(size * 0.944444, size * 0.722222, size * 0.722222, size * 0.944444, size * 0.5, size * 0.944444);
	                knobCtx.bezierCurveTo(size * 0.277777, size * 0.944444, size * 0.055555, size * 0.722222, size * 0.055555, size * 0.5);
	                knobCtx.closePath();
	                grad = knobCtx.createLinearGradient(0, 0.055555 * size, 0, 0.944443 * size);
	                switch (style.style) {
	                case 'black':
	                    grad.addColorStop(0, 'rgb(43, 42, 47)');
	                    grad.addColorStop(1, 'rgb(26, 27, 32)');
	                    break;
	
	                case 'brass':
	                    grad.addColorStop(0, 'rgb(150, 110, 54)');
	                    grad.addColorStop(1, 'rgb(124, 95, 61)');
	                    break;
	
	                case 'silver':
	                /* falls through */
	                default:
	                    grad.addColorStop(0, 'rgb(204, 204, 204)');
	                    grad.addColorStop(1, 'rgb(87, 92, 98)');
	                    break;
	                }
	                knobCtx.fillStyle = grad;
	                knobCtx.fill();
	
	                // METALKNOB_LOWERHL
	                knobCtx.beginPath();
	                knobCtx.moveTo(size * 0.777777, size * 0.833333);
	                knobCtx.bezierCurveTo(size * 0.722222, size * 0.722222, size * 0.611111, size * 0.666666, size * 0.5, size * 0.666666);
	                knobCtx.bezierCurveTo(size * 0.388888, size * 0.666666, size * 0.277777, size * 0.722222, size * 0.222222, size * 0.833333);
	                knobCtx.bezierCurveTo(size * 0.277777, size * 0.888888, size * 0.388888, size * 0.944444, size * 0.5, size * 0.944444);
	                knobCtx.bezierCurveTo(size * 0.611111, size * 0.944444, size * 0.722222, size * 0.888888, size * 0.777777, size * 0.833333);
	                knobCtx.closePath();
	                grad = knobCtx.createRadialGradient((0.555555) * size, ((0.944444) * size), 0, ((0.555555) * size), ((0.944444) * size), 0.388888 * size);
	                grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
	                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
	                knobCtx.fillStyle = grad;
	                knobCtx.fill();
	
	                // METALKNOB_UPPERHL
	                knobCtx.beginPath();
	                knobCtx.moveTo(size * 0.944444, size * 0.277777);
	                knobCtx.bezierCurveTo(size * 0.833333, size * 0.111111, size * 0.666666, 0, size * 0.5, 0);
	                knobCtx.bezierCurveTo(size * 0.333333, 0, size * 0.166666, size * 0.111111, size * 0.055555, size * 0.277777);
	                knobCtx.bezierCurveTo(size * 0.166666, size * 0.333333, size * 0.333333, size * 0.388888, size * 0.5, size * 0.388888);
	                knobCtx.bezierCurveTo(size * 0.666666, size * 0.388888, size * 0.833333, size * 0.333333, size * 0.944444, size * 0.277777);
	                knobCtx.closePath();
	                grad = knobCtx.createRadialGradient(0.5 * size, 0, 0, ((0.5) * size), 0, 0.583333 * size);
	                grad.addColorStop(0, 'rgba(255, 255, 255, 0.749019)');
	                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
	                knobCtx.fillStyle = grad;
	                knobCtx.fill();
	
	                // METALKNOB_INNERFRAME
	                knobCtx.beginPath();
	                knobCtx.moveTo(size * 0.277777, size * 0.555555);
	                knobCtx.bezierCurveTo(size * 0.277777, size * 0.388888, size * 0.388888, size * 0.277777, size * 0.5, size * 0.277777);
	                knobCtx.bezierCurveTo(size * 0.611111, size * 0.277777, size * 0.777777, size * 0.388888, size * 0.777777, size * 0.555555);
	                knobCtx.bezierCurveTo(size * 0.777777, size * 0.666666, size * 0.611111, size * 0.777777, size * 0.5, size * 0.777777);
	                knobCtx.bezierCurveTo(size * 0.388888, size * 0.777777, size * 0.277777, size * 0.666666, size * 0.277777, size * 0.555555);
	                knobCtx.closePath();
	                grad = knobCtx.createLinearGradient(0, 0.277777 * size, 0, 0.722221 * size);
	                grad.addColorStop(0, '#000000');
	                grad.addColorStop(1, 'rgb(204, 204, 204)');
	                knobCtx.fillStyle = grad;
	                knobCtx.fill();
	
	                // METALKNOB_INNERBACKGROUND
	                knobCtx.beginPath();
	                knobCtx.moveTo(size * 0.333333, size * 0.555555);
	                knobCtx.bezierCurveTo(size * 0.333333, size * 0.444444, size * 0.388888, size * 0.333333, size * 0.5, size * 0.333333);
	                knobCtx.bezierCurveTo(size * 0.611111, size * 0.333333, size * 0.722222, size * 0.444444, size * 0.722222, size * 0.555555);
	                knobCtx.bezierCurveTo(size * 0.722222, size * 0.611111, size * 0.611111, size * 0.722222, size * 0.5, size * 0.722222);
	                knobCtx.bezierCurveTo(size * 0.388888, size * 0.722222, size * 0.333333, size * 0.611111, size * 0.333333, size * 0.555555);
	                knobCtx.closePath();
	                grad = knobCtx.createLinearGradient(0, 0.333333 * size, 0, 0.666666 * size);
	                grad.addColorStop(0, 'rgb(10, 9, 1)');
	                grad.addColorStop(1, 'rgb(42, 41, 37)');
	                knobCtx.fillStyle = grad;
	                knobCtx.fill();
	                break;
	
	            case 'standardKnob':
	                grad = knobCtx.createLinearGradient(0, 0, 0, size);
	                grad.addColorStop(0, 'rgb(180, 180, 180)');
	                grad.addColorStop(0.46, 'rgb(63, 63, 63)');
	                grad.addColorStop(1, 'rgb(40, 40, 40)');
	                knobCtx.fillStyle = grad;
	                knobCtx.beginPath();
	                knobCtx.arc(maxPostCenterX, maxPostCenterY, size / 2, 0, TWO_PI, true);
	                knobCtx.closePath();
	                knobCtx.fill();
	                grad = knobCtx.createLinearGradient(0, size - size * 0.77, 0, size - size * 0.77 + size * 0.77);
	                switch (style.style) {
	                case 'black':
	                    grad.addColorStop(0, 'rgb(191, 191, 191)');
	                    grad.addColorStop(0.5, 'rgb(45, 44, 49)');
	                    grad.addColorStop(1, 'rgb(125, 126, 128)');
	                    break;
	
	                case 'brass':
	                    grad.addColorStop(0, 'rgb(223, 208, 174)');
	                    grad.addColorStop(0.5, 'rgb(123, 95, 63)');
	                    grad.addColorStop(1, 'rgb(207, 190, 157)');
	                    break;
	
	                case 'silver':
	                /* falls through */
	                default:
	                    grad.addColorStop(0, 'rgb(215, 215, 215)');
	                    grad.addColorStop(0.5, 'rgb(116, 116, 116)');
	                    grad.addColorStop(1, 'rgb(215, 215, 215)');
	                    break;
	                }
	                knobCtx.fillStyle = grad;
	                knobCtx.beginPath();
	                knobCtx.arc(maxPostCenterX, maxPostCenterY, size * 0.77 / 2, 0, TWO_PI, true);
	                knobCtx.closePath();
	                knobCtx.fill();
	
	                grad = knobCtx.createRadialGradient(maxPostCenterX, maxPostCenterY, 0, maxPostCenterX, maxPostCenterY, size * 0.77 / 2);
	                grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
	                grad.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
	                grad.addColorStop(0.76, 'rgba(0, 0, 0, 0.01)');
	                grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
	                knobCtx.fillStyle = grad;
	                knobCtx.beginPath();
	                knobCtx.arc(maxPostCenterX, maxPostCenterY, size * 0.77 / 2, 0, TWO_PI, true);
	                knobCtx.closePath();
	                knobCtx.fill();
	                break;
	            }
	
	            // cache the buffer
	            createKnobImage.cache[cacheKey] = knobBuffer;
	        }
	        return createKnobImage.cache[cacheKey];
	    };
	    createKnobImage.cache = {};
	
	    var createLedImage = function (size, state, ledColor) {
	        var ledBuffer, ledCtx,
	            ledCenterX = size / 2,
	            ledCenterY = size / 2,
	            grad,
	            cacheKey = size.toString() + state + ledColor.outerColor_ON;
	
	        // check if we have already created and cached this buffer, if not create it
	        if (!createLedImage.cache[cacheKey]) {
	            ledBuffer = createBuffer(size, size);
	            ledCtx = ledBuffer.getContext('2d');
	
	            switch (state) {
	            case 0: // LED OFF
	                // OFF Gradient
	                grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * 0.5 / 2);
	                grad.addColorStop(0, ledColor.innerColor1_OFF);
	                grad.addColorStop(0.2, ledColor.innerColor2_OFF);
	                grad.addColorStop(1, ledColor.outerColor_OFF);
	                ledCtx.fillStyle = grad;
	
	                ledCtx.beginPath();
	                ledCtx.arc(ledCenterX, ledCenterY, size * 0.5 / 2, 0, TWO_PI, true);
	                ledCtx.closePath();
	                ledCtx.fill();
	
	                // InnerShadow
	                grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * 0.5 / 2);
	                grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
	                grad.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
	                grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
	                ledCtx.fillStyle = grad;
	
	                ledCtx.beginPath();
	                ledCtx.arc(ledCenterX, ledCenterY, size * 0.5 / 2, 0, TWO_PI, true);
	                ledCtx.closePath();
	                ledCtx.fill();
	
	                // LightReflex
	                grad = ledCtx.createLinearGradient(0, 0.35 * size, 0, 0.35 * size + 0.15 * size);
	                grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
	                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
	                ledCtx.fillStyle = grad;
	
	                ledCtx.beginPath();
	                ledCtx.arc(ledCenterX, 0.35 * size + 0.2 * size / 2, size * 0.2, 0, TWO_PI, true);
	                ledCtx.closePath();
	                ledCtx.fill();
	                break;
	
	            case 1: // LED ON
	                // ON Gradient
	                grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * 0.5 / 2);
	                grad.addColorStop(0, ledColor.innerColor1_ON);
	                grad.addColorStop(0.2, ledColor.innerColor2_ON);
	                grad.addColorStop(1, ledColor.outerColor_ON);
	                ledCtx.fillStyle = grad;
	
	                ledCtx.beginPath();
	                ledCtx.arc(ledCenterX, ledCenterY, size * 0.5 / 2, 0, TWO_PI, true);
	                ledCtx.closePath();
	                ledCtx.fill();
	
	                // InnerShadow
	                grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * 0.5 / 2);
	                grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
	                grad.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
	                grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
	                ledCtx.fillStyle = grad;
	
	                ledCtx.beginPath();
	                ledCtx.arc(ledCenterX, ledCenterY, size * 0.5 / 2, 0, TWO_PI, true);
	                ledCtx.closePath();
	                ledCtx.fill();
	
	                // LightReflex
	                grad = ledCtx.createLinearGradient(0, 0.35 * size, 0, 0.35 * size + 0.15 * size);
	                grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
	                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
	                ledCtx.fillStyle = grad;
	
	                ledCtx.beginPath();
	                ledCtx.arc(ledCenterX, 0.35 * size + 0.2 * size / 2, size * 0.2, 0, TWO_PI, true);
	                ledCtx.closePath();
	                ledCtx.fill();
	
	                // Corona
	                grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size / 2);
	                grad.addColorStop(0, setAlpha(ledColor.coronaColor, 0).color);
	                grad.addColorStop(0.6, setAlpha(ledColor.coronaColor, 0.4).color);
	                grad.addColorStop(0.7, setAlpha(ledColor.coronaColor, 0.25).color);
	                grad.addColorStop(0.8, setAlpha(ledColor.coronaColor, 0.15).color);
	                grad.addColorStop(0.85, setAlpha(ledColor.coronaColor, 0.05).color);
	                grad.addColorStop(1, setAlpha(ledColor.coronaColor, 0).color);
	                ledCtx.fillStyle = grad;
	
	                ledCtx.beginPath();
	                ledCtx.arc(ledCenterX, ledCenterY, size / 2, 0, TWO_PI, true);
	                ledCtx.closePath();
	                ledCtx.fill();
	                break;
	            }
	            // cache the buffer
	            createLedImage.cache[cacheKey] = ledBuffer;
	        }
	        return createLedImage.cache[cacheKey];
	    };
	    createLedImage.cache = {};
	
	    var createLcdBackgroundImage = function (width, height, lcdColor) {
	        var lcdBuffer, lcdCtx,
	            xB = 0,
	            yB = 0,
	            wB = width,
	            hB = height,
	            rB = Math.min(width, height) * 0.095,
	            grad,
	            xF = 1,
	            yF = 1,
	            wF = width - 2,
	            hF = height - 2,
	            rF = rB - 1,
	            cacheKey = width.toString() + height + JSON.stringify(lcdColor);
	
	        // check if we have already created and cached this buffer, if not create it
	        if (!createLcdBackgroundImage.cache[cacheKey]) {
	            lcdBuffer = createBuffer(width, height);
	            lcdCtx = lcdBuffer.getContext('2d');
	            // background
	            grad = lcdCtx.createLinearGradient(0, yB, 0, yB + hB);
	            grad.addColorStop(0, '#4c4c4c');
	            grad.addColorStop(0.08, '#666666');
	            grad.addColorStop(0.92, '#666666');
	            grad.addColorStop(1, '#e6e6e6');
	            lcdCtx.fillStyle = grad;
	            roundedRectangle(lcdCtx, xB, yB, wB, hB, rB);
	            lcdCtx.fill();
	
	            // foreground
	            grad = lcdCtx.createLinearGradient(0, yF, 0, yF + hF);
	            grad.addColorStop(0, lcdColor.gradientStartColor);
	            grad.addColorStop(0.03, lcdColor.gradientFraction1Color);
	            grad.addColorStop(0.49, lcdColor.gradientFraction2Color);
	            grad.addColorStop(0.5, lcdColor.gradientFraction3Color);
	            grad.addColorStop(1, lcdColor.gradientStopColor);
	            lcdCtx.fillStyle = grad;
	            roundedRectangle(lcdCtx, xF, yF, wF, hF, rF);
	            lcdCtx.fill();
	            // cache the buffer
	            createLcdBackgroundImage.cache[cacheKey] = lcdBuffer;
	        }
	        return createLcdBackgroundImage.cache[cacheKey];
	    };
	    createLcdBackgroundImage.cache = {};
	
	    var createMeasuredValueImage = function (size, indicatorColor, radial, vertical) {
	        var indicatorBuffer, indicatorCtx,
	            cacheKey = size.toString() + indicatorColor + radial + vertical;
	
	        // check if we have already created and cached this buffer, if so return it and exit
	        if (!createMeasuredValueImage.cache[cacheKey]) {
	            indicatorBuffer = doc.createElement('canvas');
	            indicatorCtx = indicatorBuffer.getContext('2d');
	            indicatorBuffer.width = size;
	            indicatorBuffer.height = size;
	            indicatorCtx.fillStyle = indicatorColor;
	            if (radial) {
	                indicatorCtx.beginPath();
	                indicatorCtx.moveTo(size * 0.5, size);
	                indicatorCtx.lineTo(0, 0);
	                indicatorCtx.lineTo(size, 0);
	                indicatorCtx.closePath();
	                indicatorCtx.fill();
	            } else {
	                if (vertical) {
	                    indicatorCtx.beginPath();
	                    indicatorCtx.moveTo(size, size * 0.5);
	                    indicatorCtx.lineTo(0, 0);
	                    indicatorCtx.lineTo(0, size);
	                    indicatorCtx.closePath();
	                    indicatorCtx.fill();
	                } else {
	                    indicatorCtx.beginPath();
	                    indicatorCtx.moveTo(size * 0.5, 0);
	                    indicatorCtx.lineTo(size, size);
	                    indicatorCtx.lineTo(0, size);
	                    indicatorCtx.closePath();
	                    indicatorCtx.fill();
	                }
	            }
	            // cache the buffer
	            createMeasuredValueImage.cache[cacheKey] = indicatorBuffer;
	        }
	        return createMeasuredValueImage.cache[cacheKey];
	    };
	    createMeasuredValueImage.cache = {};
	
	    var createTrendIndicator = function (width, onSection, colors) {
	        var height = width * 2,
	            trendBuffer, trendCtx,
	            fill,
	            cacheKey = onSection.state + width + JSON.stringify(colors),
	
	            drawUpArrow = function () {
	                // draw up arrow (red)
	                var ledColor = colors[0];
	
	                if (onSection.state === 'up') {
	                    fill = trendCtx.createRadialGradient(0.5 * width, 0.2 * height, 0, 0.5 * width, 0.2 * height, 0.5 * width);
	                    fill.addColorStop(0, ledColor.innerColor1_ON);
	                    fill.addColorStop(0.2, ledColor.innerColor2_ON);
	                    fill.addColorStop(1, ledColor.outerColor_ON);
	                } else {
	                    fill = trendCtx.createLinearGradient(0, 0, 0, 0.5 * height);
	                    fill.addColorStop(0, '#323232');
	                    fill.addColorStop(1, '#5c5c5c');
	                }
	                trendCtx.fillStyle = fill;
	                trendCtx.beginPath();
	                trendCtx.moveTo(0.5 * width, 0);
	                trendCtx.lineTo(width, 0.2 * height);
	                trendCtx.lineTo(0.752 * width, 0.2 * height);
	                trendCtx.lineTo(0.752 * width, 0.37 * height);
	                trendCtx.lineTo(0.252 * width, 0.37 * height);
	                trendCtx.lineTo(0.252 * width, 0.2 * height);
	                trendCtx.lineTo(0, 0.2 * height);
	                trendCtx.closePath();
	                trendCtx.fill();
	                if (onSection.state !== 'up') {
	                    // Inner shadow
	                    trendCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0, 0.2 * height);
	                    trendCtx.lineTo(0.5 * width, 0);
	                    trendCtx.lineTo(width, 0.2 * height);
	                    trendCtx.moveTo(0.252 * width, 0.2 * height);
	                    trendCtx.lineTo(0.252 * width, 0.37 * height);
	                    trendCtx.stroke();
	                    // Inner highlight
	                    trendCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0.252 * width, 0.37 * height);
	                    trendCtx.lineTo(0.752 * width, 0.37 * height);
	                    trendCtx.lineTo(0.752 * width, 0.2 * height);
	                    trendCtx.lineTo(width, 0.2 * height);
	                    trendCtx.stroke();
	                } else {
	                    // draw halo
	                    fill = trendCtx.createRadialGradient(0.5 * width, 0.2 * height, 0, 0.5 * width, 0.2 * height, 0.7 * width);
	                    fill.addColorStop(0, setAlpha(ledColor.coronaColor, 0).color);
	                    fill.addColorStop(0.5, setAlpha(ledColor.coronaColor, 0.3).color);
	                    fill.addColorStop(0.7, setAlpha(ledColor.coronaColor, 0.2).color);
	                    fill.addColorStop(0.8, setAlpha(ledColor.coronaColor, 0.1).color);
	                    fill.addColorStop(0.85, setAlpha(ledColor.coronaColor, 0.05).color);
	                    fill.addColorStop(1, setAlpha(ledColor.coronaColor, 0).color);
	                    trendCtx.fillStyle = fill;
	
	                    trendCtx.beginPath();
	                    trendCtx.arc(0.5 * width, 0.2 * height, 0.7 * width, 0, TWO_PI, true);
	                    trendCtx.closePath();
	                    trendCtx.fill();
	                }
	            },
	
	            drawEquals = function () {
	                // draw equal symbol
	                var ledColor = colors[1];
	
	                trendCtx.beginPath();
	                if (onSection.state === 'steady') {
	                    fill = ledColor.outerColor_ON;
	                    trendCtx.fillStyle = fill;
	                    trendCtx.rect(0.128 * width, 0.41 * height, 0.744 * width, 0.074 * height);
	                    trendCtx.rect(0.128 * width, 0.516 * height, 0.744 * width, 0.074 * height);
	                    trendCtx.closePath();
	                    trendCtx.fill();
	                } else {
	                    fill = trendCtx.createLinearGradient(0, 0.41 * height, 0, 0.41 * height + 0.074 * height);
	                    fill.addColorStop(0, '#323232');
	                    fill.addColorStop(1, '#5c5c5c');
	                    trendCtx.fillStyle = fill;
	                    trendCtx.rect(0.128 * width, 0.41 * height, 0.744 * width, 0.074 * height);
	                    trendCtx.closePath();
	                    trendCtx.fill();
	                    fill = trendCtx.createLinearGradient(0, 0.516 * height, 0, 0.516 * height + 0.074 * height);
	                    fill.addColorStop(0, '#323232');
	                    fill.addColorStop(1, '#5c5c5c');
	                    trendCtx.fillStyle = fill;
	                    trendCtx.rect(0.128 * width, 0.516 * height, 0.744 * width, 0.074 * height);
	                    trendCtx.closePath();
	                    trendCtx.fill();
	                }
	                if (onSection.state !== 'steady') {
	                    // inner shadow
	                    trendCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0.128 * width, 0.41 * height + 0.074 * height);
	                    trendCtx.lineTo(0.128 * width, 0.41 * height);
	                    trendCtx.lineTo(0.128 * width + 0.744 * width, 0.41 * height);
	                    trendCtx.stroke();
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0.128 * width, 0.516 * height + 0.074 * height);
	                    trendCtx.lineTo(0.128 * width, 0.516 * height);
	                    trendCtx.lineTo(0.128 * width + 0.744 * width, 0.516 * height);
	                    trendCtx.stroke();
	                    // inner highlight
	                    trendCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0.128 * width + 0.744 * width, 0.41 * height);
	                    trendCtx.lineTo(0.128 * width + 0.744 * width, 0.41 * height + 0.074 * height);
	                    trendCtx.lineTo(0.128 * width, 0.41 * height + 0.074 * height);
	                    trendCtx.stroke();
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0.128 * width + 0.744 * width, 0.516 * height);
	                    trendCtx.lineTo(0.128 * width + 0.744 * width, 0.516 * height + 0.074 * height);
	                    trendCtx.lineTo(0.128 * width, 0.516 * height + 0.074 * height);
	                    trendCtx.stroke();
	                } else {
	                    // draw halo
	                    fill = trendCtx.createRadialGradient(0.5 * width, 0.5 * height, 0, 0.5 * width, 0.5 * height, 0.7 * width);
	                    fill.addColorStop(0, setAlpha(ledColor.coronaColor, 0).color);
	                    fill.addColorStop(0.5, setAlpha(ledColor.coronaColor, 0.3).color);
	                    fill.addColorStop(0.7, setAlpha(ledColor.coronaColor, 0.2).color);
	                    fill.addColorStop(0.8, setAlpha(ledColor.coronaColor, 0.1).color);
	                    fill.addColorStop(0.85, setAlpha(ledColor.coronaColor, 0.05).color);
	                    fill.addColorStop(1, setAlpha(ledColor.coronaColor, 0).color);
	                    trendCtx.fillStyle = fill;
	                    trendCtx.beginPath();
	                    trendCtx.arc(0.5 * width, 0.5 * height, 0.7 * width, 0, TWO_PI, true);
	                    trendCtx.closePath();
	                    trendCtx.fill();
	                }
	            },
	
	            drawDownArrow = function () {
	                // draw down arrow
	                var ledColor = colors[2];
	                if (onSection.state === 'down') {
	                    fill = trendCtx.createRadialGradient(0.5 * width, 0.8 * height, 0, 0.5 * width, 0.8 * height, 0.5 * width);
	                    fill.addColorStop(0, ledColor.innerColor1_ON);
	                    fill.addColorStop(0.2, ledColor.innerColor2_ON);
	                    fill.addColorStop(1, ledColor.outerColor_ON);
	                } else {
	                    fill = trendCtx.createLinearGradient(0, 0.63 * height, 0, height);
	                    fill.addColorStop(0, '#323232');
	                    fill.addColorStop(1, '#5c5c5c');
	                }
	                trendCtx.beginPath();
	                trendCtx.fillStyle = fill;
	                trendCtx.moveTo(0.5 * width, height);
	                trendCtx.lineTo(width, 0.8 * height);
	                trendCtx.lineTo(0.725 * width, 0.8 * height);
	                trendCtx.lineTo(0.725 * width, 0.63 * height);
	                trendCtx.lineTo(0.252 * width, 0.63 * height);
	                trendCtx.lineTo(0.252 * width, 0.8 * height);
	                trendCtx.lineTo(0, 0.8 * height);
	                trendCtx.closePath();
	                trendCtx.fill();
	                if (onSection.state !== 'down') {
	                    // Inner shadow
	                    trendCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0, 0.8 * height);
	                    trendCtx.lineTo(0.252 * width, 0.8 * height);
	                    trendCtx.moveTo(0.252 * width, 0.63 * height);
	                    trendCtx.lineTo(0.752 * width, 0.63 * height);
	                    trendCtx.stroke();
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0.752 * width, 0.8 * height);
	                    trendCtx.lineTo(width, 0.8 * height);
	                    trendCtx.stroke();
	                    // Inner highlight
	                    trendCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0, 0.8 * height);
	                    trendCtx.lineTo(0.5 * width, height);
	                    trendCtx.lineTo(width, 0.8 * height);
	                    trendCtx.stroke();
	                    trendCtx.beginPath();
	                    trendCtx.moveTo(0.752 * width, 0.8 * height);
	                    trendCtx.lineTo(0.752 * width, 0.63 * height);
	                    trendCtx.stroke();
	                } else {
	                    // draw halo
	                    fill = trendCtx.createRadialGradient(0.5 * width, 0.8 * height, 0, 0.5 * width, 0.8 * height, 0.7 * width);
	                    fill.addColorStop(0, setAlpha(ledColor.coronaColor, 0).color);
	                    fill.addColorStop(0.5, setAlpha(ledColor.coronaColor, 0.3).color);
	                    fill.addColorStop(0.7, setAlpha(ledColor.coronaColor, 0.2).color);
	                    fill.addColorStop(0.8, setAlpha(ledColor.coronaColor, 0.1).color);
	                    fill.addColorStop(0.85, setAlpha(ledColor.coronaColor, 0.05).color);
	                    fill.addColorStop(1, setAlpha(ledColor.coronaColor, 0).color);
	                    trendCtx.fillStyle = fill;
	                    trendCtx.beginPath();
	                    trendCtx.arc(0.5 * width, 0.8 * height, 0.7 * width, 0, TWO_PI, true);
	                    trendCtx.closePath();
	                    trendCtx.fill();
	                }
	            };
	
	        // Check if we have already cached this indicator, if not create it
	        if (!createTrendIndicator.cache[cacheKey]) {
	            // create oversized buffer for the glow
	            trendBuffer = createBuffer(width * 2, width * 4);
	            trendCtx = trendBuffer.getContext('2d');
	            trendCtx.translate(width * 0.5, width * 0.5);
	            // Must draw the active section last so the 'glow' is on top
	            switch (onSection.state) {
	            case 'up':
	                drawDownArrow();
	                drawEquals();
	                drawUpArrow();
	                break;
	            case 'steady':
	                drawDownArrow();
	                drawUpArrow();
	                drawEquals();
	                break;
	            case 'down':
	            /* falls through */
	            default:
	                drawUpArrow();
	                drawEquals();
	                drawDownArrow();
	                break;
	            }
	            // cache the buffer
	            createTrendIndicator.cache[cacheKey] = trendBuffer;
	        }
	        return createTrendIndicator.cache[cacheKey];
	    };
	    createTrendIndicator.cache = {};
	
	    var drawTitleImage = function (ctx, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, radial, altPos, gaugeType) {
	        gaugeType = (undefined === gaugeType ? gaugeType = steelseries.GaugeType.TYPE1 : gaugeType);
	        ctx.save();
	        ctx.textAlign = (radial ? 'center' : 'left');
	        ctx.textBaseline = 'middle';
	        ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
	        ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
	
	        if (radial) {
	            ctx.font = 0.046728 * imageWidth + 'px ' + stdFontName;
	            ctx.fillText(titleString, imageWidth / 2, imageHeight * 0.3, imageWidth * 0.3);
	            ctx.fillText(unitString, imageWidth / 2, imageHeight * 0.38, imageWidth * 0.3);
	        } else {
	            // linear
	            if (vertical) {
	                ctx.font = 0.1 * imageWidth + 'px ' + stdFontName;
	                ctx.save();
	                ctx.translate(0.671428 * imageWidth, 0.1375 * imageHeight);
	                ctx.rotate(1.570796);
	                ctx.fillText(titleString, 0, 0);
	                ctx.translate(-0.671428 * imageWidth, -0.1375 * imageHeight);
	                ctx.restore();
	                ctx.font = 0.071428 * imageWidth + 'px ' + stdFontName;
	                if (altPos) {
	                    // LCD visible
	                    if (gaugeType.type === 'type2') {
	                        ctx.textAlign = 'right';
	                        ctx.fillText(unitString, 0.36 * imageWidth, imageHeight * 0.79, imageWidth * 0.25);
	                    } else {
	                        ctx.fillText(unitString, 0.63 * imageWidth, imageHeight * 0.85, imageWidth * 0.2);
	                    }
	                } else {
	                    // LCD hidden
	                    ctx.textAlign = 'center';
	                    if (gaugeType.type === 'type2') {
	                        ctx.fillText(unitString, imageWidth / 2, imageHeight * 0.92, imageWidth * 0.2);
	                    } else {
	                        ctx.fillText(unitString, imageWidth / 2, imageHeight * 0.89, imageWidth * 0.2);
	                    }
	                }
	            } else { //linear horizontal
	                ctx.font = 0.035 * imageWidth + 'px ' + stdFontName;
	                ctx.fillText(titleString, imageWidth * 0.15, imageHeight * 0.25, imageWidth * 0.3);
	                ctx.font = 0.025 * imageWidth + 'px ' + stdFontName;
	                ctx.fillText(unitString, imageWidth * 0.0625, imageHeight * 0.7, imageWidth * 0.07);
	            }
	        }
	        ctx.restore();
	    };
	
	    //*****************************************   T E X T U R E S   ****************************************************
	    var carbonBuffer = drawToBuffer(12, 12, function (ctx) {
	            var imageWidth = ctx.canvas.width,
	                imageHeight = ctx.canvas.height,
	                offsetX = 0,
	                offsetY = 0,
	                grad;
	
	            ctx.save();
	
	            // RULB
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(0, 0, imageWidth * 0.5, imageHeight * 0.5);
	            ctx.closePath();
	            ctx.restore();
	
	            grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.5 * imageHeight + offsetY * imageHeight);
	            grad.addColorStop(0, 'rgb(35, 35, 35)');
	            grad.addColorStop(1, 'rgb(23, 23, 23)');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // RULF
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(imageWidth * 0.083333, 0, imageWidth * 0.333333, imageHeight * 0.416666);
	            ctx.closePath();
	            ctx.restore();
	            offsetX = 0.083333;
	            offsetY = 0;
	            grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.416666 * imageHeight + offsetY * imageHeight);
	            grad.addColorStop(0, 'rgb(38, 38, 38)');
	            grad.addColorStop(1, 'rgb(30, 30, 30)');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // RLRB
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(imageWidth * 0.5, imageHeight * 0.5, imageWidth * 0.5, imageHeight * 0.5);
	            ctx.closePath();
	            ctx.restore();
	            offsetX = 0.5;
	            offsetY = 0.5;
	            grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.5 * imageHeight + offsetY * imageHeight);
	            grad.addColorStop(0, 'rgb(35, 35, 35)');
	            grad.addColorStop(1, 'rgb(23, 23, 23)');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // RLRF
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(imageWidth * 0.583333, imageHeight * 0.5, imageWidth * 0.333333, imageHeight * 0.416666);
	            ctx.closePath();
	            ctx.restore();
	            offsetX = 0.583333;
	            offsetY = 0.5;
	            grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.416666 * imageHeight + offsetY * imageHeight);
	            grad.addColorStop(0, 'rgb(38, 38, 38)');
	            grad.addColorStop(1, 'rgb(30, 30, 30)');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // RURB
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(imageWidth * 0.5, 0, imageWidth * 0.5, imageHeight * 0.5);
	            ctx.closePath();
	            ctx.restore();
	            offsetX = 0.5;
	            offsetY = 0;
	            grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.5 * imageHeight + offsetY * imageHeight);
	            grad.addColorStop(0, '#303030');
	            grad.addColorStop(1, 'rgb(40, 40, 40)');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // RURF
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(imageWidth * 0.583333, imageHeight * 0.083333, imageWidth * 0.333333, imageHeight * 0.416666);
	            ctx.closePath();
	            ctx.restore();
	            offsetX = 0.583333;
	            offsetY = 0.083333;
	            grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.416666 * imageHeight + offsetY * imageHeight);
	            grad.addColorStop(0, 'rgb(53, 53, 53)');
	            grad.addColorStop(1, 'rgb(45, 45, 45)');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // RLLB
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(0, imageHeight * 0.5, imageWidth * 0.5, imageHeight * 0.5);
	            ctx.closePath();
	            ctx.restore();
	            offsetX = 0;
	            offsetY = 0.5;
	            grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.5 * imageHeight + offsetY * imageHeight);
	            grad.addColorStop(0, '#303030');
	            grad.addColorStop(1, '#282828');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            // RLLF
	            ctx.save();
	            ctx.beginPath();
	            ctx.rect(imageWidth * 0.083333, imageHeight * 0.583333, imageWidth * 0.333333, imageHeight * 0.416666);
	            ctx.closePath();
	            ctx.restore();
	            offsetX = 0.083333;
	            offsetY = 0.583333;
	            grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.416666 * imageHeight + offsetY * imageHeight);
	            grad.addColorStop(0, '#353535');
	            grad.addColorStop(1, '#2d2d2d');
	            ctx.fillStyle = grad;
	            ctx.fill();
	
	            ctx.restore();
	        });
	
	    var punchedSheetBuffer = drawToBuffer(15, 15, function (ctx) {
	        var imageWidth = ctx.canvas.width,
	            imageHeight = ctx.canvas.height,
	            grad;
	
	        ctx.save();
	
	        // BACK
	        ctx.save();
	        ctx.beginPath();
	        ctx.rect(0, 0, imageWidth, imageHeight);
	        ctx.closePath();
	        ctx.restore();
	        ctx.fillStyle = '#1D2123';
	        ctx.fill();
	
	        // ULB
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(0, imageHeight * 0.266666);
	        ctx.bezierCurveTo(0, imageHeight * 0.4, imageWidth * 0.066666, imageHeight * 0.466666, imageWidth * 0.2, imageHeight * 0.466666);
	        ctx.bezierCurveTo(imageWidth * 0.333333, imageHeight * 0.466666, imageWidth * 0.4, imageHeight * 0.4, imageWidth * 0.4, imageHeight * 0.266666);
	        ctx.bezierCurveTo(imageWidth * 0.4, imageHeight * 0.133333, imageWidth * 0.333333, imageHeight * 0.066666, imageWidth * 0.2, imageHeight * 0.066666);
	        ctx.bezierCurveTo(imageWidth * 0.066666, imageHeight * 0.066666, 0, imageHeight * 0.133333, 0, imageHeight * 0.266666);
	        ctx.closePath();
	        grad = ctx.createLinearGradient(0, 0.066666 * imageHeight, 0, 0.466666 * imageHeight);
	        grad.addColorStop(0, '#000000');
	        grad.addColorStop(1, '#444444');
	        ctx.fillStyle = grad;
	        ctx.fill();
	
	        // ULF
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(0, imageHeight * 0.2);
	        ctx.bezierCurveTo(0, imageHeight * 0.333333, imageWidth * 0.066666, imageHeight * 0.4, imageWidth * 0.2, imageHeight * 0.4);
	        ctx.bezierCurveTo(imageWidth * 0.333333, imageHeight * 0.4, imageWidth * 0.4, imageHeight * 0.333333, imageWidth * 0.4, imageHeight * 0.2);
	        ctx.bezierCurveTo(imageWidth * 0.4, imageHeight * 0.066666, imageWidth * 0.333333, 0, imageWidth * 0.2, 0);
	        ctx.bezierCurveTo(imageWidth * 0.066666, 0, 0, imageHeight * 0.066666, 0, imageHeight * 0.2);
	        ctx.closePath();
	        ctx.fillStyle = '#050506';
	        ctx.fill();
	
	        // LRB
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.466666, imageHeight * 0.733333);
	        ctx.bezierCurveTo(imageWidth * 0.466666, imageHeight * 0.866666, imageWidth * 0.533333, imageHeight * 0.933333, imageWidth * 0.666666, imageHeight * 0.933333);
	        ctx.bezierCurveTo(imageWidth * 0.8, imageHeight * 0.933333, imageWidth * 0.866666, imageHeight * 0.866666, imageWidth * 0.866666, imageHeight * 0.733333);
	        ctx.bezierCurveTo(imageWidth * 0.866666, imageHeight * 0.6, imageWidth * 0.8, imageHeight * 0.533333, imageWidth * 0.666666, imageHeight * 0.533333);
	        ctx.bezierCurveTo(imageWidth * 0.533333, imageHeight * 0.533333, imageWidth * 0.466666, imageHeight * 0.6, imageWidth * 0.466666, imageHeight * 0.733333);
	        ctx.closePath();
	        grad = ctx.createLinearGradient(0, 0.533333 * imageHeight, 0, 0.933333 * imageHeight);
	        grad.addColorStop(0, '#000000');
	        grad.addColorStop(1, '#444444');
	        ctx.fillStyle = grad;
	        ctx.fill();
	
	        // LRF
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(imageWidth * 0.466666, imageHeight * 0.666666);
	        ctx.bezierCurveTo(imageWidth * 0.466666, imageHeight * 0.8, imageWidth * 0.533333, imageHeight * 0.866666, imageWidth * 0.666666, imageHeight * 0.866666);
	        ctx.bezierCurveTo(imageWidth * 0.8, imageHeight * 0.866666, imageWidth * 0.866666, imageHeight * 0.8, imageWidth * 0.866666, imageHeight * 0.666666);
	        ctx.bezierCurveTo(imageWidth * 0.866666, imageHeight * 0.533333, imageWidth * 0.8, imageHeight * 0.466666, imageWidth * 0.666666, imageHeight * 0.466666);
	        ctx.bezierCurveTo(imageWidth * 0.533333, imageHeight * 0.466666, imageWidth * 0.466666, imageHeight * 0.533333, imageWidth * 0.466666, imageHeight * 0.666666);
	        ctx.closePath();
	        ctx.fillStyle = '#050506';
	        ctx.fill();
	
	        ctx.restore();
	    });
	
	    var brushedMetalTexture = function (color, radius, amount, monochrome, shine) {
	
	        this.fill = function (startX, startY, endX, endY) {
	            var i, x, y,                        // loop counters
	                sinArr,
	                width, height,
	                outCanvas, outCanvasContext,    // output canvas
	                inPixels, outPixels,            // pixel arrays
	                //alpha = color & 0xff000000;
	                alpha = 255,
	                red = (color >> 16) & 0xff,
	                green = (color >> 8) & 0xff,
	                blue = color & 0xff,
	                n = 0,
	                variation = 255 * amount,
	                totR, totG, totB,
	                indx, tr, tg, tb, f;
	
	            startX = Math.floor(startX);
	            startY = Math.floor(startY);
	            endX = Math.ceil(endX);
	            endY = Math.ceil(endY);
	
	            width = endX - startX;
	            height = endY - startY;
	
	            // Create output canvas
	            outCanvas = createBuffer(width, height);
	            outCanvasContext = outCanvas.getContext('2d');
	
	            // Create pixel arrays
	            inPixels = outCanvasContext.createImageData(width, height);
	            outPixels = outCanvasContext.createImageData(width, height);
	
	            // Precreate sin() values
	            if (shine !== 0) {
	                sinArr = [];
	                for (i = 0; i < width; i++) {
	                    sinArr[i] = (255 * shine * Math.sin(i / width * PI)) | 0;
	                }
	            }
	
	            for (y = 0; y < height; y++) {
	                // The pixel array is addressed as 4 elements per pixel [r,g,b,a]
	                if (radius !== 0) {
	                    totR = totG = totB = 0;
	                }
	                for (x = 0; x < width; x ++) {
	                    indx = (y * width * 4) + (x * 4);
	                    tr = red;
	                    tg = green;
	                    tb = blue;
	                    if (shine !== 0) {
	                        f = sinArr[x];
	                        tr += f;
	                        tg += f;
	                        tb += f;
	                    }
	
	                    if (monochrome) {
	                        n = ((2 * Math.random() - 1) * variation) | 0;
	                        inPixels.data[indx]   = clamp(tr + n);
	                        inPixels.data[indx + 1] = clamp(tg + n);
	                        inPixels.data[indx + 2] = clamp(tb + n);
	                        inPixels.data[indx + 3] = alpha;
	                    } else {
	                        inPixels.data[indx]   = random(tr, variation);
	                        inPixels.data[indx + 1] = random(tg, variation);
	                        inPixels.data[indx + 2] = random(tb, variation);
	                        inPixels.data[indx + 3] = alpha;
	                    }
	                }
	            }
	
	            if (radius > 0) {
	                horizontalBlur(inPixels, outPixels, width, height, radius, alpha);
	                outCanvasContext.putImageData(outPixels, startX, startY);
	            } else {
	                outCanvasContext.putImageData(inPixels, startX, startY);
	            }
	            return outCanvas;
	        };
	
	        function random(x, vari) {
	            x += ((2 * Math.random() - 1) * vari) | 0;
	            return (x < 0 ? 0 : (x > 255 ? 255 : x));
	        }
	
	        function clamp(C) {
	            return (C < 0 ? 0 : (C > 255 ? 255 : C));
	        }
	
	        function horizontalBlur(inPix, outPix, width, height, radius, alpha) {
	            var x, y,       // loop counters
	                i, mul, indx,
	                totR, totG, totB;
	
	            if (radius >= width) {
	                radius = width - 1;
	            }
	            mul = 1 / (radius * 2 + 1);
	            indx = 0;
	            for (y = 0; y < height; y++) {
	                totR = totG = totB = 0;
	                for (x = 0; x < radius ; x++) {
	                    i = (indx + x) * 4;
	                    totR += inPix.data[i];
	                    totG += inPix.data[i + 1];
	                    totB += inPix.data[i + 2];
	                }
	                for (x = 0; x < width; x++) {
	                    if (x > radius) {
	                        i = (indx - radius - 1) * 4;
	                        totR -= inPix.data[i];
	                        totG -= inPix.data[i + 1];
	                        totB -= inPix.data[i + 2];
	                    }
	                    if (x + radius < width) {
	                        i = (indx + radius) * 4;
	                        totR += inPix.data[i];
	                        totG += inPix.data[i + 1];
	                        totB += inPix.data[i + 2];
	                    }
	                    i = indx * 4;
	                    outPix.data[i] = (totR * mul) | 0;
	                    outPix.data[i + 1] = (totG * mul) | 0;
	                    outPix.data[i + 2] = (totB * mul) | 0;
	                    outPix.data[i + 3] = alpha;
	                    indx++;
	                }
	            }
	        }
	
	        return this;
	    };
	
	    //********************************************   T O O L S   *******************************************************
	    var RgbaColor = function (r, g, b, a) {
	        var red, green, blue, alpha;
	
	        if (arguments.length === 1) {
	            // hexadecimal input #112233
	            b = parseInt(r.substr(5, 2), 16);
	            g = parseInt(r.substr(3, 2), 16);
	            r = parseInt(r.substr(1, 2), 16);
	            a = 1;
	        } else if (arguments.length === 3) {
	            a = 1;
	        }
	
	        function validateColors() {
	            red = range(r, 255);
	            green = range(g, 255);
	            blue = range(b, 255);
	            alpha = range(a, 1);
	        }
	
	        validateColors();
	
	        this.getRed = function () {
	            return red;
	        };
	
	        this.setRed = function (r) {
	            red = range(r, 255);
	        };
	
	        this.getGreen = function () {
	            return green;
	        };
	
	        this.setGreen = function (g) {
	            green = range(g, 255);
	        };
	
	        this.getBlue = function () {
	            return blue;
	        };
	
	        this.setBlue = function (b) {
	            blue = range(b, 255);
	        };
	
	        this.getAlpha = function () {
	            return alpha;
	        };
	
	        this.setAlpha = function (a) {
	            alpha = range(a, 1);
	        };
	
	        this.getRgbaColor = function () {
	            return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
	        };
	
	        this.getRgbColor = function () {
	            return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
	        };
	
	        this.getHexColor = function () {
	            return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
	        };
	    };
	
	    var ConicalGradient = function (fractions, colors) {
	        var limit = fractions.length - 1,
	            i;
	
	        // Pre-multipy fractions array into range -PI to PI
	        for (i = 0; i <= limit; i++) {
	            fractions[i] = TWO_PI * fractions[i] - PI;
	        }
	
	        this.fillCircle = function (ctx, centerX, centerY, innerX, outerX) {
	            var angle,
	                radius = Math.ceil(outerX),
	                diameter = radius * 2,
	                pixels, alpha,
	                x, y, dx, dy, dy2, distance,
	                indx, pixColor,
	                buffer, bufferCtx;
	
	// Original Version using rotated lines
	/*
	            ctx.save();
	            ctx.lineWidth = 1.5;
	            ctx.translate(centerX, centerY);
	            ctx.rotate(rotationOffset);
	            ctx.translate(-centerX, -centerY);
	            for (i = 0, size = fractions.length - 1; i < size; i++) {
	                startAngle = TWO_PI * fractions[i];
	                stopAngle = TWO_PI * fractions[i + 1];
	                range = stopAngle - startAngle;
	                startColor = colors[i];
	                stopColor = colors[i + 1];
	                for (angle = startAngle; angle < stopAngle; angle += angleStep) {
	                    ctx.beginPath();
	                    ctx.fillStyle = getColorFromFraction(startColor, stopColor, range, (angle - startAngle)).getRgbaColor();
	                    ctx.strokeStyle = ctx.fillStyle;
	                    if (innerX > 0) {
	                        ctx.arc(centerX, centerY, innerX, angle + angleStep, angle, true);
	                    } else {
	                        ctx.moveTo(centerX, centerY);
	                    }
	                    ctx.arc(centerX, centerY, outerX, angle, angle + angleStep);
	                    ctx.fill();
	                    ctx.stroke();
	                }
	            }
	*/
	// End - Original Version
	
	            // Create pixel array
	            pixels = ctx.createImageData(diameter, diameter);
	            alpha = 255;
	
	            for (y = 0; y < diameter; y++) {
	                dy = radius - y;
	                dy2 = dy * dy;
	                for (x = 0; x < diameter; x++) {
	                    dx = x - radius;
	                    distance = Math.sqrt((dx * dx) + dy2);
	                    if (distance <= radius && distance >= innerX) { // pixels are transparent by default, so only paint the ones we need
	                        angle = Math.atan2(dx, dy);
	                        for (i = 0; i < limit; i++) {
	                            if (angle >= fractions[i] && angle < fractions[i + 1]) {
	                                pixColor = getColorFromFraction(colors[i], colors[i + 1], fractions[i + 1] - fractions[i], angle - fractions[i], true);
	                            }
	                        }
	                        // The pixel array is addressed as 4 elements per pixel [r,g,b,a]
	                        indx = ((diameter - y) * diameter * 4) + (x * 4);  // plot is 180 rotated from orginal method, so apply a simple invert (diameter - y)
	                        pixels.data[indx]     = pixColor[0];
	                        pixels.data[indx + 1] = pixColor[1];
	                        pixels.data[indx + 2] = pixColor[2];
	                        pixels.data[indx + 3] = alpha;
	                    }
	                }
	            }
	
	            // Create a new buffer to apply the raw data so we can rotate it
	            buffer = createBuffer(diameter, diameter);
	            bufferCtx = buffer.getContext('2d');
	            bufferCtx.putImageData(pixels, 0, 0);
	            // Apply the image buffer
	            ctx.drawImage(buffer, centerX - radius, centerY - radius);
	        };
	
	        this.fillRect = function (ctx, centerX, centerY, width, height, thicknessX, thicknessY) {
	            var angle,
	                width2,
	                height2,
	                pixels, alpha,
	                x, y, dx, dy,
	                indx,
	                pixColor,
	                buffer, bufferCtx;
	
	            width = Math.ceil(width);
	            height = Math.ceil(height);
	            width2 = width / 2;
	            height2 = height / 2;
	            thicknessX = Math.ceil(thicknessX);
	            thicknessY = Math.ceil(thicknessY);
	
	            // Create pixel array
	            pixels = ctx.createImageData(width, height);
	            alpha = 255;
	
	            for (y = 0; y < height; y++) {
	                dy = height2 - y;
	                for (x = 0; x < width; x++) {
	                    if (y > thicknessY && y < height - thicknessY) {
	                        // we are in the range where we only draw the sides
	                        if (x > thicknessX && x < width - thicknessX) {
	                            // we are in the empty 'middle', jump to the next edge
	                            x = width - thicknessX;
	                        }
	                    }
	                    dx = x - width2;
	                    angle = Math.atan2(dx, dy);
	                    for (i = 0; i < limit; i++) {
	                        if (angle >= fractions[i] && angle < fractions[i + 1]) {
	                            pixColor = getColorFromFraction(colors[i], colors[i + 1], fractions[i + 1] - fractions[i], angle - fractions[i], true);
	                        }
	                    }
	                    // The pixel array is addressed as 4 elements per pixel [r,g,b,a]
	                    indx = ((height - y) * width * 4) + (x * 4); // plot is 180 rotated from orginal method, so apply a simple invert (height - y)
	                    pixels.data[indx]     = pixColor[0];
	                    pixels.data[indx + 1] = pixColor[0];
	                    pixels.data[indx + 2] = pixColor[0];
	                    pixels.data[indx + 3] = alpha;
	                }
	            }
	            // Create a new buffer to apply the raw data so we can clip it when drawing to canvas
	            buffer = createBuffer(width, height);
	            bufferCtx = buffer.getContext('2d');
	            bufferCtx.putImageData(pixels, 0, 0);
	
	            // draw the buffer back to the canvas
	            ctx.drawImage(buffer, centerX - width2, centerY - height2);
	        };
	
	    };
	
	    var GradientWrapper = function (start, end, fractions, colors) {
	
	        this.getColorAt = function (fraction) {
	            var lowerLimit = 0,
	                lowerIndex = 0,
	                upperLimit = 1,
	                upperIndex = 1,
	                i,
	                interpolationFraction;
	
	            fraction = (fraction < 0 ? 0 : (fraction > 1 ? 1 : fraction));
	
	            for (i = 0; i < fractions.length; i++) {
	                if (fractions[i] < fraction && lowerLimit < fractions[i]) {
	                    lowerLimit = fractions[i];
	                    lowerIndex = i;
	                }
	                if (fractions[i] === fraction) {
	                    return colors[i];
	                }
	                if (fractions[i] > fraction && upperLimit >= fractions[i]) {
	                    upperLimit = fractions[i];
	                    upperIndex = i;
	                }
	            }
	            interpolationFraction = (fraction - lowerLimit) / (upperLimit - lowerLimit);
	            return getColorFromFraction(colors[lowerIndex], colors[upperIndex], 1, interpolationFraction);
	        };
	
	        this.getStart = function () {
	            return start;
	        };
	
	        this.getEnd = function () {
	            return end;
	        };
	    };
	
	    function setAlpha(hex, alpha) {
	        var hexColor = ('#' === hex.charAt(0)) ? hex.substring(1, 7) : hex,
	            red = parseInt((hexColor).substring(0, 2), 16),
	            green = parseInt((hexColor).substring(2, 4), 16),
	            blue = parseInt((hexColor).substring(4, 6), 16);
	
	        this.color = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
	
	        return this;
	    }
	
	    function getColorFromFraction(sourceColor, destinationColor, range, fraction, returnRawData) {
	        var INT_TO_FLOAT = 1 / 255,
	            sourceRed = sourceColor.getRed(),
	            sourceGreen = sourceColor.getGreen(),
	            sourceBlue = sourceColor.getBlue(),
	            sourceAlpha = sourceColor.getAlpha(),
	
	            deltaRed = destinationColor.getRed() - sourceRed,
	            deltaGreen = destinationColor.getGreen() - sourceGreen,
	            deltaBlue = destinationColor.getBlue() - sourceBlue,
	            deltaAlpha = destinationColor.getAlpha() * INT_TO_FLOAT - sourceAlpha * INT_TO_FLOAT,
	
	            fractionRed = deltaRed / range * fraction,
	            fractionGreen = deltaGreen / range * fraction,
	            fractionBlue = deltaBlue / range * fraction,
	            fractionAlpha = deltaAlpha / range * fraction;
	
	        returnRawData = returnRawData || false;
	        if (returnRawData) {
	            return [(sourceRed + fractionRed).toFixed(0), (sourceGreen + fractionGreen).toFixed(0), (sourceBlue + fractionBlue).toFixed(0), sourceAlpha + fractionAlpha];
	        } else {
	            return new RgbaColor((sourceRed + fractionRed).toFixed(0), (sourceGreen + fractionGreen).toFixed(0), (sourceBlue + fractionBlue).toFixed(0), sourceAlpha + fractionAlpha);
	        }
	    }
	
	    function section(start, stop, color) {
	        return {start : start,
	                stop : stop,
	                color : color};
	    }
	
	    Math.log10 = function (value) {
	        return (Math.log(value) / Math.LN10);
	    };
	
	    function calcNiceNumber(range, round) {
	        var exponent = Math.floor(Math.log10(range)),   // exponent of range
	            fraction = range / Math.pow(10, exponent),  // fractional part of range
	            niceFraction;                               // nice, rounded fraction
	
	        if (round) {
	            if (1.5 > fraction) {
	                niceFraction = 1;
	            } else if (3 > fraction) {
	                niceFraction = 2;
	            } else if (7 > fraction) {
	                niceFraction = 5;
	            } else {
	                niceFraction = 10;
	            }
	        } else {
	            if (1 >= fraction) {
	                niceFraction = 1;
	            } else if (2 >= fraction) {
	                niceFraction = 2;
	            } else if (5 >= fraction) {
	                niceFraction = 5;
	            } else {
	                niceFraction = 10;
	            }
	        }
	        return niceFraction * Math.pow(10, exponent);
	    }
	
	    function roundedRectangle(ctx, x, y, w, h, radius) {
	        var r = x + w,
	            b = y + h;
	        ctx.beginPath();
	        ctx.moveTo(x + radius, y);
	        ctx.lineTo(r - radius, y);
	        ctx.quadraticCurveTo(r, y, r, y + radius);
	        ctx.lineTo(r, y + h - radius);
	        ctx.quadraticCurveTo(r, b, r - radius, b);
	        ctx.lineTo(x + radius, b);
	        ctx.quadraticCurveTo(x, b, x, b - radius);
	        ctx.lineTo(x, y + radius);
	        ctx.quadraticCurveTo(x, y, x + radius, y);
	        ctx.closePath();
	        ctx.stroke();
	    }
	
	    function createBuffer(width, height) {
	        var buffer = doc.createElement('canvas');
	        buffer.width = width;
	        buffer.height = height;
	        return buffer;
	    }
	
	    function drawToBuffer(width, height, drawFunction) {
	        var buffer = doc.createElement('canvas');
	        buffer.width = width;
	        buffer.height = height;
	        drawFunction(buffer.getContext('2d'));
	        return buffer;
	    }
	
	    function getColorValues(color) {
	        var colorData,
	            lookupBuffer = drawToBuffer(1, 1, function (ctx) {
	                ctx.fillStyle = color;
	                ctx.beginPath();
	                ctx.rect(0, 0, 1, 1);
	                ctx.fill();
	            });
	        colorData = lookupBuffer.getContext('2d').getImageData(0, 0, 2, 2).data;
	
	        /*
	        for (var i = 0; i < data.length; i += 4) {
	            var red = data[i];       // red
	            var green = data[i + 1]; // green
	            var blue = data[i + 2];  // blue
	            //var alpha = data[i + 3]; // alpha
	            console.log(red + ', ' + green + ', ' + blue);
	        }
	        */
	
	        return [colorData[0], colorData[1], colorData[2], colorData[3]];
	    }
	
	    function customColorDef(color) {
	        var VERY_DARK,
	            DARK,
	            LIGHT,
	            LIGHTER,
	            VERY_LIGHT,
	            values = getColorValues(color),
	            rgbaCol = new RgbaColor(values[0], values[1], values[2], values[3]);
	
	        VERY_DARK = darker(rgbaCol, 0.32);
	        DARK = darker(rgbaCol, 0.62);
	        LIGHT = lighter(rgbaCol, 0.84);
	        LIGHTER = lighter(rgbaCol, 0.94);
	        VERY_LIGHT = lighter(rgbaCol, 1);
	
	        return new ColorDef(VERY_DARK, DARK, rgbaCol, LIGHT, LIGHTER, VERY_LIGHT);
	    }
	
	    function rgbToHsl(red, green, blue) {
	        var min, max, hue, saturation, lightness, delta;
	
	        red /= 255;
	        green /= 255;
	        blue /= 255;
	
	        max = Math.max(red, green, blue);
	        min = Math.min(red, green, blue);
	        lightness = (max + min) / 2;
	
	        if (max === min) {
	            hue = saturation = 0; // achromatic
	        } else {
	            delta = max - min;
	            saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
	            switch (max) {
	            case red:
	                hue = (green - blue) / delta + (green < blue ? 6 : 0);
	                break;
	            case green:
	                hue = (blue - red) / delta + 2;
	                break;
	            case blue:
	                hue = (red - green) / delta + 4;
	                break;
	            }
	            hue /= 6;
	        }
	        return [hue, saturation, lightness];
	    }
	
	/* These functions are not currently used
	    function hslToRgb(hue, saturation, lightness) {
	        var red, green, blue, p, q;
	
	        function hue2rgb(p, q, t) {
	            if (t < 0) {
	                t += 1;
	            }
	            if (t > 1) {
	                t -= 1;
	            }
	            if (t < 1 / 6) {
	                return p + (q - p) * 6 * t;
	            }
	            if (t < 1 / 2) {
	                return q;
	            }
	            if (t < 2 / 3) {
	                return p + (q - p) * (2 / 3 - t) * 6;
	            }
	            return p;
	        }
	
	        if (saturation === 0) {
	            red = green = blue = lightness; // achromatic
	        } else {
	            q = (lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation);
	            p = 2 * lightness - q;
	            red = hue2rgb(p, q, hue + 1 / 3);
	            green = hue2rgb(p, q, hue);
	            blue = hue2rgb(p, q, hue - 1 / 3);
	        }
	
	        return [Math.floor(red * 255), Math.floor(green * 255), Math.floor(blue * 255)];
	    }
	
	    function hsbToHsl(hue, saturation, brightness) {
	        var lightness = (brightness - saturation) / 2;
	        lightness = range(lightness, 1);
	        return [hue, saturation, lightness];
	    }
	
	    function hslToHsb(hue, saturation, lightness) {
	        var brightness = (lightness * 2) + saturation;
	        return [hue, saturation, brightness];
	    }
	*/
	
	    function hsbToRgb(hue, saturation, brightness) {
	        var r, g, b,
	            i = Math.floor(hue * 6),
	            f = hue * 6 - i,
	            p = brightness * (1 - saturation),
	            q = brightness * (1 - f * saturation),
	            t = brightness * (1 - (1 - f) * saturation);
	
	        switch (i % 6) {
	        case 0:
	            r = brightness;
	            g = t;
	            b = p;
	            break;
	        case 1:
	            r = q;
	            g = brightness;
	            b = p;
	            break;
	        case 2:
	            r = p;
	            g = brightness;
	            b = t;
	            break;
	        case 3:
	            r = p;
	            g = q;
	            b = brightness;
	            break;
	        case 4:
	            r = t;
	            g = p;
	            b = brightness;
	            break;
	        case 5:
	            r = brightness;
	            g = p;
	            b = q;
	            break;
	        }
	
	        return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
	    }
	
	    function rgbToHsb(r, g, b) {
	        var min, max, hue, saturation, brightness, delta;
	
	        r = r / 255;
	        g = g / 255;
	        b = b / 255;
	        max = Math.max(r, g, b);
	        min = Math.min(r, g, b);
	        brightness = max;
	        delta = max - min;
	        saturation = max === 0 ? 0 : delta / max;
	
	        if (max === min) {
	            hue = 0; // achromatic
	        } else {
	            switch (max) {
	            case r:
	                hue = (g - b) / delta + (g < b ? 6 : 0);
	                break;
	            case g:
	                hue = (b - r) / delta + 2;
	                break;
	            case b:
	                hue = (r - g) / delta + 4;
	                break;
	            }
	            hue /= 6;
	        }
	        return [hue, saturation, brightness];
	    }
	
	    function range(value, limit) {
	        return (value < 0 ? 0 : (value > limit ? limit : value));
	    }
	
	    function darker(color, fraction) {
	        var red = Math.floor(color.getRed() * (1 - fraction)),
	            green = Math.floor(color.getGreen() * (1 - fraction)),
	            blue = Math.floor(color.getBlue() * (1 - fraction));
	
	        red = range(red, 255);
	        green = range(green, 255);
	        blue = range(blue, 255);
	
	        return new RgbaColor(red, green, blue, color.getAlpha());
	    }
	
	    function lighter(color, fraction) {
	        var red = Math.round(color.getRed() * (1 + fraction)),
	            green = Math.round(color.getGreen() * (1 + fraction)),
	            blue = Math.round(color.getBlue() * (1 + fraction));
	
	        red = range(red, 255);
	        green = range(green, 255);
	        blue = range(blue, 255);
	
	        return new RgbaColor(red, green, blue, color.getAlpha());
	    }
	
	    function wrap(value, lower, upper) {
	        var distance, times;
	        if (upper <= lower) {
	            throw 'Rotary bounds are of negative or zero size';
	        }
	
	        distance = upper - lower;
	        times = Math.floor((value - lower) / distance);
	
	        return value - (times * distance);
	    }
	
	    function getShortestAngle(from, to) {
	        return wrap((to - from), -180, 180);
	    }
	
	    // shim layer
	    var requestAnimFrame = (function () {
	        return  window.requestAnimationFrame   ||
	            window.webkitRequestAnimationFrame ||
	            window.mozRequestAnimationFrame    ||
	            window.oRequestAnimationFrame      ||
	            window.msRequestAnimationFrame     ||
	            function (callback) {
	                window.setTimeout(callback, 1000 / 16);
	            };
	    }());
	
	    function getCanvasContext(elementOrId) {
	        var element = (typeof elementOrId === 'string' || elementOrId instanceof String) ?
	            doc.getElementById(elementOrId) : elementOrId;
	        return element.getContext('2d');
	    }
	
	/*
	    function blur(ctx, width, height, radius) {
	    // This function is too CPU expensive
	    // leave disabled for now :(
	
	        // Cheap'n'cheerful blur filter, just applies horizontal and vertical blurs
	        // Only works for square canvas's at present
	
	        var j, x, y,      // loop counters
	            i,
	            end,
	            totR, totG, totB, totA,
	            // Create a temporary buffer
	            tempBuffer = createBuffer(width, height),
	            tempCtx = tempBuffer.getContext('2d'),
	            // pixel data
	            inPix, outPix,
	            mul,
	            indx;
	
	        ctx.save();
	
	        for (j = 0; j < 2; j++) {
	            // Get access to the pixel data
	            inPix = ctx.getImageData(0, 0, (j === 0 ? width : height), (j === 0 ? height : width));
	            outPix = ctx.createImageData((j === 0 ? width : height), (j === 0 ? height : width));
	
	            if (j === 0) { // Horizontal blur
	                if (radius >= width) {
	                    radius = width - 1;
	                }
	            } else { // Vertical blur
	                if (radius >= height) {
	                    radius = height - 1;
	                }
	            }
	            mul = 1 / (radius * 2 + 1);
	            indx = 0;
	            for (y = 0, end = (j === 0 ? height : width); y < end; y++) {
	                totR = totG = totB = totA = 0;
	                for (x = 0; x < radius ; x++) {
	                    i = (indx + x) * 4;
	                    totR += inPix.data[i];
	                    totG += inPix.data[i + 1];
	                    totB += inPix.data[i + 2];
	                    totA += inPix.data[i + 3];
	                }
	                for (x = 0; x < (j === 0 ? width : height); x++) {
	                    if (x > radius) {
	                        i = (indx - radius - 1) * 4;
	                        totR -= inPix.data[i];
	                        totG -= inPix.data[i + 1];
	                        totB -= inPix.data[i + 2];
	                        totA -= inPix.data[i + 3];
	                    }
	                    if (x + radius < width) {
	                        i = (indx + radius) * 4;
	                        totR += inPix.data[i];
	                        totG += inPix.data[i + 1];
	                        totB += inPix.data[i + 2];
	                        totA += inPix.data[i + 3];
	                    }
	                    i = indx * 4;
	                    outPix.data[i] = (totR * mul) | 0;
	                    outPix.data[i + 1] = (totG * mul) | 0;
	                    outPix.data[i + 2] = (totB * mul) | 0;
	                    outPix.data[i + 3] = (totA * mul) | 0;
	                    indx++;
	                }
	            }
	            // Write the output pixel data back to the temp buffer
	            tempCtx.clearRect(0, 0, width, height);
	            tempCtx.putImageData(outPix, 0, 0);
	            if (j === 0) {
	                // Clear the input canvas
	                ctx.clearRect(0, 0, width, height);
	                // Rotate image by 90 degrees
	                ctx.translate(width / 2, height / 2);
	                ctx.rotate(HALF_PI);
	                ctx.translate(-width / 2, -height / 2);
	                // Write the buffer back
	                ctx.drawImage(tempBuffer, 0, 0);
	            }
	        }
	        ctx.translate(width / 2, height / 2);
	        ctx.rotate(-PI);
	        ctx.translate(-width / 2, -height / 2);
	        // Clear the input canvas
	        ctx.clearRect(0, 0, width, height);
	        ctx.drawImage(tempBuffer, 0, 0);
	        ctx.restore();
	
	    }
	*/
	    //****************************************   C O N S T A N T S   ***************************************************
	    var BackgroundColorDef;
	    (function () {
	        BackgroundColorDef = function (gradientStart, gradientFraction, gradientStop, labelColor, symbolColor, name) {
	            this.gradientStart = gradientStart;
	            this.gradientFraction = gradientFraction;
	            this.gradientStop = gradientStop;
	            this.labelColor = labelColor;
	            this.symbolColor = symbolColor;
	            this.name = name;
	        };
	    }());
	
	    var LcdColorDef;
	    (function () {
	        LcdColorDef = function (gradientStartColor, gradientFraction1Color, gradientFraction2Color, gradientFraction3Color, gradientStopColor, textColor) {
	            this.gradientStartColor = gradientStartColor;
	            this.gradientFraction1Color = gradientFraction1Color;
	            this.gradientFraction2Color = gradientFraction2Color;
	            this.gradientFraction3Color = gradientFraction3Color;
	            this.gradientStopColor = gradientStopColor;
	            this.textColor = textColor;
	        };
	    }());
	
	    var ColorDef;
	    (function () {
	        ColorDef = function (veryDark, dark, medium, light, lighter, veryLight) {
	            this.veryDark = veryDark;
	            this.dark = dark;
	            this.medium = medium;
	            this.light = light;
	            this.lighter = lighter;
	            this.veryLight = veryLight;
	        };
	    }());
	
	    var LedColorDef;
	    (function () {
	        LedColorDef = function (innerColor1_ON, innerColor2_ON, outerColor_ON, coronaColor, innerColor1_OFF, innerColor2_OFF, outerColor_OFF) {
	            this.innerColor1_ON = innerColor1_ON;
	            this.innerColor2_ON = innerColor2_ON;
	            this.outerColor_ON = outerColor_ON;
	            this.coronaColor = coronaColor;
	            this.innerColor1_OFF = innerColor1_OFF;
	            this.innerColor2_OFF = innerColor2_OFF;
	            this.outerColor_OFF = outerColor_OFF;
	        };
	    }());
	
	    var GaugeTypeDef;
	    (function () {
	        GaugeTypeDef = function (type) {
	            this.type = type;
	        };
	    }());
	
	    var OrientationDef;
	    (function () {
	        OrientationDef = function (type) {
	            this.type = type;
	        };
	    }());
	
	    var KnobTypeDef;
	    (function () {
	        KnobTypeDef = function (type) {
	            this.type = type;
	        };
	    }());
	
	    var KnobStyleDef;
	    (function () {
	        KnobStyleDef = function (style) {
	            this.style = style;
	        };
	    }());
	
	    var FrameDesignDef;
	    (function () {
	        FrameDesignDef = function (design) {
	            this.design = design;
	        };
	    }());
	
	    var PointerTypeDef;
	    (function () {
	        PointerTypeDef = function (type) {
	            this.type = type;
	        };
	    }());
	
	    var ForegroundTypeDef;
	    (function () {
	        ForegroundTypeDef = function (type) {
	            this.type = type;
	        };
	    }());
	
	    var LabelNumberFormatDef;
	    (function () {
	        LabelNumberFormatDef = function (format) {
	            this.format = format;
	        };
	    }());
	
	    var TickLabelOrientationDef;
	    (function () {
	        TickLabelOrientationDef = function (type) {
	            this.type = type;
	        };
	    }());
	
	    var TrendStateDef;
	    (function () {
	        TrendStateDef = function (state) {
	            this.state = state;
	        };
	    }());
	
	    //*************************   I m p l e m e n t a t i o n s   o f   d e f i n i t i o n s   ************************
	    var backgroundColor = {
	        DARK_GRAY: new BackgroundColorDef(new RgbaColor(0, 0, 0, 1), new RgbaColor(51, 51, 51, 1), new RgbaColor(153, 153, 153, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(180, 180, 180, 1), 'DARK_GRAY'),
	        SATIN_GRAY: new BackgroundColorDef(new RgbaColor(45, 57, 57, 1), new RgbaColor(45, 57, 57, 1), new RgbaColor(45, 57, 57, 1), new RgbaColor(167, 184, 180, 1), new RgbaColor(137, 154, 150, 1), 'SATIN_GRAY'),
	        LIGHT_GRAY: new BackgroundColorDef(new RgbaColor(130, 130, 130, 1), new RgbaColor(181, 181, 181, 1), new RgbaColor(253, 253, 253, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), 'LIGHT_GRAY'),
	        WHITE: new BackgroundColorDef(new RgbaColor(255, 255, 255, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), 'WHITE'),
	        BLACK: new BackgroundColorDef(new RgbaColor(0, 0, 0, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(150, 150, 150, 1), 'BLACK'),
	        BEIGE: new BackgroundColorDef(new RgbaColor(178, 172, 150, 1), new RgbaColor(204, 205, 184, 1), new RgbaColor(231, 231, 214, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), 'BEIGE'),
	        BROWN: new BackgroundColorDef(new RgbaColor(245, 225, 193, 1), new RgbaColor(245, 225, 193, 1), new RgbaColor(255, 250, 240, 1), new RgbaColor(109, 73, 47, 1), new RgbaColor(89, 53, 27, 1), 'BROWN'),
	        RED: new BackgroundColorDef(new RgbaColor(198, 93, 95, 1), new RgbaColor(212, 132, 134, 1), new RgbaColor(242, 218, 218, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(90, 0, 0, 1), 'RED'),
	        GREEN: new BackgroundColorDef(new RgbaColor(65, 120, 40, 1), new RgbaColor(129, 171, 95, 1), new RgbaColor(218, 237, 202, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(0, 90, 0, 1), 'GREEN'),
	        BLUE: new BackgroundColorDef(new RgbaColor(45, 83, 122, 1), new RgbaColor(115, 144, 170, 1), new RgbaColor(227, 234, 238, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(0, 0, 90, 1), 'BLUE'),
	        ANTHRACITE: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(69, 69, 74, 1), new RgbaColor(250, 250, 250, 1), new RgbaColor(180, 180, 180, 1), 'ANTHRACITE'),
	        MUD: new BackgroundColorDef(new RgbaColor(80, 86, 82, 1), new RgbaColor(70, 76, 72, 1), new RgbaColor(57, 62, 58, 1), new RgbaColor(255, 255, 240, 1), new RgbaColor(225, 225, 210, 1), 'MUD'),
	        PUNCHED_SHEET: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(69, 69, 74, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(180, 180, 180, 1), 'PUNCHED_SHEET'),
	        CARBON: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(69, 69, 74, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(180, 180, 180, 1), 'CARBON'),
	        STAINLESS: new BackgroundColorDef(new RgbaColor(130, 130, 130, 1), new RgbaColor(181, 181, 181, 1), new RgbaColor(253, 253, 253, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), 'STAINLESS'),
	        BRUSHED_METAL: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(69, 69, 74, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), 'BRUSHED_METAL'),
	        BRUSHED_STAINLESS: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(110, 110, 112, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), 'BRUSHED_STAINLESS'),
	        TURNED: new BackgroundColorDef(new RgbaColor(130, 130, 130, 1), new RgbaColor(181, 181, 181, 1), new RgbaColor(253, 253, 253, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), 'TURNED')
	    };
	
	    var lcdColor = {
	        BEIGE: new LcdColorDef('#c8c8b1', 'rgb(241, 237, 207)', 'rgb(234, 230, 194)', 'rgb(225, 220, 183)', 'rgb(237, 232, 191)', '#000000'),
	        BLUE: new LcdColorDef('#ffffff', 'rgb(231, 246, 255)', 'rgb(170, 224, 255)', 'rgb(136, 212, 255)', 'rgb(192, 232, 255)', '#124564'),
	        ORANGE: new LcdColorDef('#ffffff', 'rgb(255, 245, 225)', 'rgb(255, 217, 147)', 'rgb(255, 201, 104)', 'rgb(255, 227, 173)', '#503700'),
	        RED: new LcdColorDef('#ffffff', 'rgb(255, 225, 225)', 'rgb(253, 152, 152)', 'rgb(252, 114, 115)', 'rgb(254, 178, 178)', '#4f0c0e'),
	        YELLOW: new LcdColorDef('#ffffff', 'rgb(245, 255, 186)', 'rgb(210, 255, 0)', 'rgb(158, 205, 0)', 'rgb(210, 255, 0)', '#405300'),
	        WHITE: new LcdColorDef('#ffffff', '#ffffff', 'rgb(241, 246, 242)', 'rgb(229, 239, 244)', '#ffffff', '#000000'),
	        GRAY: new LcdColorDef('#414141', 'rgb(117, 117, 117)', 'rgb(87, 87, 87)', '#414141', 'rgb(81, 81, 81)', '#ffffff'),
	        BLACK: new LcdColorDef('#414141', '#666666', '#333333', '#000000', '#333333', '#cccccc'),
	        GREEN: new LcdColorDef('rgb(33, 67, 67)', 'rgb(33, 67, 67)', 'rgb(29, 58, 58)', 'rgb(28, 57, 57)', 'rgb(23, 46, 46)', 'rgba(0, 185, 165, 255)'),
	        BLUE2: new LcdColorDef('rgb(0, 68, 103)', 'rgb(8, 109, 165)', 'rgb(0, 72, 117)', 'rgb(0, 72, 117)', 'rgb(0, 68, 103)', 'rgb(111, 182, 228)'),
	        BLUE_BLACK: new LcdColorDef('rgb(22, 125, 212)', 'rgb(3, 162, 254)', 'rgb(3, 162, 254)', 'rgb(3, 162, 254)', 'rgb(11, 172, 244)', '#000000'),
	        BLUE_DARKBLUE: new LcdColorDef('rgb(18, 33, 88)', 'rgb(18, 33, 88)', 'rgb(19, 30, 90)', 'rgb(17, 31, 94)', 'rgb(21, 25, 90)', 'rgb(23, 99, 221)'),
	        BLUE_GRAY: new LcdColorDef('rgb(135, 174, 255)', 'rgb(101, 159, 255)', 'rgb(44, 93, 255)', 'rgb(27, 65, 254)', 'rgb(12, 50, 255)', '#b2b4ed'),
	        STANDARD: new LcdColorDef('rgb(131, 133, 119)', 'rgb(176, 183, 167)', 'rgb(165, 174, 153)', 'rgb(166, 175, 156)', 'rgb(175, 184, 165)', 'rgb(35, 42, 52)'),
	        STANDARD_GREEN: new LcdColorDef('#ffffff', 'rgb(219, 230, 220)', 'rgb(179, 194, 178)', 'rgb(153, 176, 151)', 'rgb(114, 138, 109)', '#080C06'),
	        BLUE_BLUE: new LcdColorDef('rgb(100, 168, 253)', 'rgb(100, 168, 253)', 'rgb(95, 160, 250)', 'rgb(80, 144, 252)', 'rgb(74, 134, 255)', '#002cbb'),
	        RED_DARKRED: new LcdColorDef('rgb(72, 36, 50)', 'rgb(185, 111, 110)', 'rgb(148, 66, 72)', 'rgb(83, 19, 20)', 'rgb(7, 6, 14)', '#FE8B92'),
	        DARKBLUE: new LcdColorDef('rgb(14, 24, 31)', 'rgb(46, 105, 144)', 'rgb(19, 64, 96)', 'rgb(6, 20, 29)', 'rgb(8, 9, 10)', '#3DB3FF'),
	        LILA: new LcdColorDef('rgb(175, 164, 255)', 'rgb(188, 168, 253)', 'rgb(176, 159, 255)', 'rgb(174, 147, 252)', 'rgb(168, 136, 233)', '#076148'),
	        BLACKRED: new LcdColorDef('rgb(8, 12, 11)', 'rgb(10, 11, 13)', 'rgb(11, 10, 15)', 'rgb(7, 13, 9)', 'rgb(9, 13, 14)', '#B50026'),
	        DARKGREEN: new LcdColorDef('rgb(25, 85, 0)', 'rgb(47, 154, 0)', 'rgb(30, 101, 0)', 'rgb(30, 101, 0)', 'rgb(25, 85, 0)', '#233123'),
	        AMBER: new LcdColorDef('rgb(182, 71, 0)', 'rgb(236, 155, 25)', 'rgb(212, 93, 5)', 'rgb(212, 93, 5)', 'rgb(182, 71, 0)', '#593A0A'),
	        LIGHTBLUE: new LcdColorDef('rgb(125, 146, 184)', 'rgb(197, 212, 231)', 'rgb(138, 155, 194)', 'rgb(138, 155, 194)', 'rgb(125, 146, 184)', '#090051'),
	        SECTIONS: new LcdColorDef('#b2b2b2', '#ffffff', '#c4c4c4', '#c4c4c4', '#b2b2b2', '#000000')
	    };
	
	    var color = {
	        RED: new ColorDef(new RgbaColor(82, 0, 0, 1), new RgbaColor(158, 0, 19, 1), new RgbaColor(213, 0, 25, 1), new RgbaColor(240, 82, 88, 1), new RgbaColor(255, 171, 173, 1), new RgbaColor(255, 217, 218, 1)),
	        GREEN: new ColorDef(new RgbaColor(8, 54, 4, 1), new RgbaColor(0, 107, 14, 1), new RgbaColor(15, 148, 0, 1), new RgbaColor(121, 186, 37, 1), new RgbaColor(190, 231, 141, 1), new RgbaColor(234, 247, 218, 1)),
	        BLUE: new ColorDef(new RgbaColor(0, 11, 68, 1), new RgbaColor(0, 73, 135, 1), new RgbaColor(0, 108, 201, 1), new RgbaColor(0, 141, 242, 1), new RgbaColor(122, 200, 255, 1), new RgbaColor(204, 236, 255, 1)),
	        ORANGE: new ColorDef(new RgbaColor(118, 83, 30, 1), new RgbaColor(215, 67, 0, 1), new RgbaColor(240, 117, 0, 1), new RgbaColor(255, 166, 0, 1), new RgbaColor(255, 255, 128, 1), new RgbaColor(255, 247, 194, 1)),
	        YELLOW: new ColorDef(new RgbaColor(41, 41, 0, 1), new RgbaColor(102, 102, 0, 1), new RgbaColor(177, 165, 0, 1), new RgbaColor(255, 242, 0, 1), new RgbaColor(255, 250, 153, 1), new RgbaColor(255, 252, 204, 1)),
	        CYAN: new ColorDef(new RgbaColor(15, 109, 109, 1), new RgbaColor(0, 109, 144, 1), new RgbaColor(0, 144, 191, 1), new RgbaColor(0, 174, 239, 1), new RgbaColor(153, 223, 249, 1), new RgbaColor(204, 239, 252, 1)),
	        MAGENTA: new ColorDef(new RgbaColor(98, 0, 114, 1), new RgbaColor(128, 24, 72, 1), new RgbaColor(191, 36, 107, 1), new RgbaColor(255, 48, 143, 1), new RgbaColor(255, 172, 210, 1), new RgbaColor(255, 214, 23, 1)),
	        WHITE: new ColorDef(new RgbaColor(210, 210, 210, 1), new RgbaColor(220, 220, 220, 1), new RgbaColor(235, 235, 235, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(255, 255, 255, 1)),
	        GRAY: new ColorDef(new RgbaColor(25, 25, 25, 1), new RgbaColor(51, 51, 51, 1), new RgbaColor(76, 76, 76, 1), new RgbaColor(128, 128, 128, 1), new RgbaColor(204, 204, 204, 1), new RgbaColor(243, 243, 243, 1)),
	        BLACK: new ColorDef(new RgbaColor(0, 0, 0, 1), new RgbaColor(5, 5, 5, 1), new RgbaColor(10, 10, 10, 1), new RgbaColor(15, 15, 15, 1), new RgbaColor(20, 20, 20, 1), new RgbaColor(25, 25, 25, 1)),
	        RAITH: new ColorDef(new RgbaColor(0, 32, 65, 1), new RgbaColor(0, 65, 125, 1), new RgbaColor(0, 106, 172, 1), new RgbaColor(130, 180, 214, 1), new RgbaColor(148, 203, 242, 1), new RgbaColor(191, 229, 255, 1)),
	        GREEN_LCD: new ColorDef(new RgbaColor(0, 55, 45, 1), new RgbaColor(15, 109, 93, 1), new RgbaColor(0, 185, 165, 1), new RgbaColor(48, 255, 204, 1), new RgbaColor(153, 255, 227, 1), new RgbaColor(204, 255, 241, 1)),
	        JUG_GREEN: new ColorDef(new RgbaColor(0, 56, 0, 1), new RgbaColor(32, 69, 36, 1), new RgbaColor(50, 161, 0, 1), new RgbaColor(129, 206, 0, 1), new RgbaColor(190, 231, 141, 1), new RgbaColor(234, 247, 218, 1))
	    };
	
	    var ledColor = {
	        RED_LED: new LedColorDef('#FF9A89', '#FF9A89', '#FF3300', '#FF8D70', '#7E1C00', '#7E1C00', '#641B00'),
	        GREEN_LED: new LedColorDef('#9AFF89', '#9AFF89', '#59FF2A', '#A5FF00', '#1C7E00', '#1C7E00', '#1B6400'),
	        BLUE_LED: new LedColorDef('#899AFF', '#899AFF', '#0033FF', '#708DFF', '#001C7E', '#001C7E', '#001B64'),
	        ORANGE_LED: new LedColorDef('#FEA23F', '#FEA23F', '#FD6C00', '#FD6C00', '#592800', '#592800', '#421F00'),
	        YELLOW_LED: new LedColorDef('#FFFF62', '#FFFF62', '#FFFF00', '#FFFF00', '#6B6D00', '#6B6D00', '#515300'),
	        CYAN_LED: new LedColorDef('#00FFFF', '#00FFFF', '#1BC3C3', '#00FFFF', '#083B3B', '#083B3B', '#052727'),
	        MAGENTA_LED: new LedColorDef('#D300FF', '#D300FF', '#8600CB', '#C300FF', '#38004B', '#38004B', '#280035')
	    };
	
	    var gaugeType = {
	        TYPE1: new GaugeTypeDef('type1'),
	        TYPE2: new GaugeTypeDef('type2'),
	        TYPE3: new GaugeTypeDef('type3'),
	        TYPE4: new GaugeTypeDef('type4'),
	        TYPE5: new GaugeTypeDef('type5')
	    };
	
	    var orientation = {
	        NORTH: new OrientationDef('north'),
	        SOUTH: new OrientationDef('south'),
	        EAST: new OrientationDef('east'),
	        WEST: new OrientationDef('west')
	    };
	
	    var knobType = {
	        STANDARD_KNOB: new KnobTypeDef('standardKnob'),
	        METAL_KNOB: new KnobTypeDef('metalKnob')
	    };
	
	    var knobStyle = {
	        BLACK: new KnobStyleDef('black'),
	        BRASS: new KnobStyleDef('brass'),
	        SILVER: new KnobStyleDef('silver')
	    };
	
	    var frameDesign = {
	        BLACK_METAL: new FrameDesignDef('blackMetal'),
	        METAL: new FrameDesignDef('metal'),
	        SHINY_METAL: new FrameDesignDef('shinyMetal'),
	        BRASS: new FrameDesignDef('brass'),
	        STEEL: new FrameDesignDef('steel'),
	        CHROME: new FrameDesignDef('chrome'),
	        GOLD: new FrameDesignDef('gold'),
	        ANTHRACITE: new FrameDesignDef('anthracite'),
	        TILTED_GRAY: new FrameDesignDef('tiltedGray'),
	        TILTED_BLACK: new FrameDesignDef('tiltedBlack'),
	        GLOSSY_METAL: new FrameDesignDef('glossyMetal')
	    };
	
	    var pointerType = {
	        TYPE1: new PointerTypeDef('type1'),
	        TYPE2: new PointerTypeDef('type2'),
	        TYPE3: new PointerTypeDef('type3'),
	        TYPE4: new PointerTypeDef('type4'),
	        TYPE5: new PointerTypeDef('type5'),
	        TYPE6: new PointerTypeDef('type6'),
	        TYPE7: new PointerTypeDef('type7'),
	        TYPE8: new PointerTypeDef('type8'),
	        TYPE9: new PointerTypeDef('type9'),
	        TYPE10: new PointerTypeDef('type10'),
	        TYPE11: new PointerTypeDef('type11'),
	        TYPE12: new PointerTypeDef('type12'),
	        TYPE13: new PointerTypeDef('type13'),
	        TYPE14: new PointerTypeDef('type14'),
	        TYPE15: new PointerTypeDef('type15'),
	        TYPE16: new PointerTypeDef('type16')
	    };
	
	    var foregroundType = {
	        TYPE1: new ForegroundTypeDef('type1'),
	        TYPE2: new ForegroundTypeDef('type2'),
	        TYPE3: new ForegroundTypeDef('type3'),
	        TYPE4: new ForegroundTypeDef('type4'),
	        TYPE5: new ForegroundTypeDef('type5')
	    };
	
	    var labelNumberFormat = {
	        STANDARD: new LabelNumberFormatDef('standard'),
	        FRACTIONAL: new LabelNumberFormatDef('fractional'),
	        SCIENTIFIC: new LabelNumberFormatDef('scientific')
	    };
	
	    var tickLabelOrientation = {
	        NORMAL: new TickLabelOrientationDef('normal'),
	        HORIZONTAL: new TickLabelOrientationDef('horizontal'),
	        TANGENT: new TickLabelOrientationDef('tangent')
	    };
	
	    var trendState = {
	        UP: new TrendStateDef('up'),
	        STEADY: new TrendStateDef('steady'),
	        DOWN: new TrendStateDef('down'),
	        OFF: new TrendStateDef('off')
	    };
	
	    //**********************************   E X P O R T   F U N C T I O N S   *******************************************
	    return {
	        // Components EXTERNAL : INTERNAL
	        Radial : radial,
	        RadialBargraph : radialBargraph,
	        RadialVertical : radialVertical,
	        Linear: linear,
	        LinearBargraph: linearBargraph,
	        DisplaySingle: displaySingle,
	        DisplayMulti: displayMulti,
	        Level : level,
	        Compass : compass,
	        WindDirection : windDirection,
	        Horizon : horizon,
	        Led : led,
	        Clock : clock,
	        Battery : battery,
	        StopWatch : stopwatch,
	        Altimeter : altimeter,
	        TrafficLight: trafficlight,
	        LightBulb: lightbulb,
	        Odometer: odometer,
	
	        // Images
	        drawFrame : drawRadialFrameImage,
	        drawBackground : drawRadialBackgroundImage,
	        drawForeground : drawRadialForegroundImage,
	
	        // Tools
	        rgbaColor :  RgbaColor,
	        ConicalGradient : ConicalGradient,
	        setAlpha : setAlpha,
	        getColorFromFraction : getColorFromFraction,
	        gradientWrapper : GradientWrapper,
	
	        // Constants
	        BackgroundColor : backgroundColor,
	        LcdColor : lcdColor,
	        ColorDef : color,
	        LedColor : ledColor,
	        GaugeType : gaugeType,
	        Orientation: orientation,
	        FrameDesign : frameDesign,
	        PointerType : pointerType,
	        ForegroundType : foregroundType,
	        KnobType : knobType,
	        KnobStyle: knobStyle,
	        LabelNumberFormat: labelNumberFormat,
	        TickLabelOrientation: tickLabelOrientation,
	        TrendState: trendState,
	
	        // Other
	        Section : section
	    };
	}());
	module.exports = steelseries;


/***/ },
/* 2 */
/*!*****************************!*\
  !*** ./lib/simplegauges.js ***!
  \*****************************/
/***/ function(module, exports) {

	function GaugeSet() {
	  this.speed = new steelseries.Radial('speedCanvas', {
	    gaugeType: steelseries.GaugeType.TYPE4,
	    frameDesign: steelseries.FrameDesign.TILTED_BLACK,
	    size: 400,
	    titleString: "SOG",
	    unitString: "knots",
	    lcdVisible: true,
	    maxValue: 10,
	    maxMeasuredValue: 0,
	    maxMeasuredValueVisible: true,
	    thresholdVisible: false,
	    ledVisible: false,
	    pointerType: steelseries.PointerType.TYPE4
	  });
	
	  this.depth = new steelseries.Radial('depthCanvas', {
	    gaugeType: steelseries.GaugeType.TYPE4,
	    frameDesign: steelseries.FrameDesign.TILTED_BLACK,
	    size: 400,
	    section: [
	      steelseries.Section(0, 4, 'rgba(255, 0, 0, 0.3)'),
	      steelseries.Section(4, 8, 'rgba(220, 220, 0, 0.3)')
	    ],
	    titleString: "Depth",
	    unitString: "m",
	    lcdVisible: true,
	    maxValue: 20,
	    maxMeasuredValue: 0,
	    maxMeasuredValueVisible: true,
	    thresholdVisible: false,
	    ledVisible: false,
	    pointerType: steelseries.PointerType.TYPE2
	  });
	
	  this.compass = new steelseries.Compass('compassCanvas', {
	    frameDesign: steelseries.FrameDesign.TILTED_BLACK,
	    size: 400,
	    rotateFace: true,
	    pointerType: steelseries.PointerType.TYPE5
	  });
	
	  this.wind = new steelseries.WindDirection('windCanvas', {
	    frameDesign: steelseries.FrameDesign.TILTED_BLACK,
	    size: 400,
	    lcdVisible: true,
	    degreeScaleHalf: true,
	    pointSymbolsVisible: false,
	    pointerType: steelseries.PointerType.TYPE5,
	  });
	
	
	  this.eventHandlers = {
	    "navigation.speedOverGround": function(value) {
	      if (value != null) {
	        this.speed.setValue(value);
	      }
	    }.bind(this),
	    "navigation.courseOverGroundTrue": function(value) {
	      this.compass.setValue(value);
	    }.bind(this),
	    "environment.depth.belowTransducer": function(value) {
	      this.depth.setValue(value);
	    }.bind(this),
	    "environment.wind.angleApparent": function(value) {
	      this.wind.setValueLatest(value);
	    }.bind(this)
	  }
	  this.dispatch = this.doDispatch.bind(this);
	};
	
	GaugeSet.prototype = {
	  doDispatch: function dispatch(delta) {
	    if (delta.context === 'vessels.' + this.selfId && delta.updates) {
	      var that  = this;
	      delta.updates.forEach(function(update) {
	        update.values.forEach(function(value) {
	          if (that.eventHandlers[value.path] && typeof that.eventHandlers[value.path] === 'function') {
	            that.eventHandlers[value.path](value.value);
	          }
	        })
	      })
	    }
	  },
	  zero: function() {
	    this.speed.setValue(0);
	    this.compass.setValue(0);
	    this.depth.setValue(0);
	    this.wind.setValueLatest(0);
	    this.wind.setValueAverage(0);
	  },
	  setSelfId: function(selfId) {
	    this.selfId = selfId;
	  }
	}
	
	
	
	module.exports.GaugeSet = GaugeSet;


/***/ },
/* 3 */
/*!*****************************!*\
  !*** ./~/ws/lib/browser.js ***!
  \*****************************/
/***/ function(module, exports) {

	
	/**
	 * Module dependencies.
	 */
	
	var global = (function() { return this; })();
	
	/**
	 * WebSocket constructor.
	 */
	
	var WebSocket = global.WebSocket || global.MozWebSocket;
	
	/**
	 * Module exports.
	 */
	
	module.exports = WebSocket ? ws : null;
	
	/**
	 * WebSocket constructor.
	 *
	 * The third `opts` options object gets ignored in web browsers, since it's
	 * non-standard, and throws a TypeError if passed to the constructor.
	 * See: https://github.com/einaros/ws/issues/227
	 *
	 * @param {String} uri
	 * @param {Array} protocols (optional)
	 * @param {Object) opts (optional)
	 * @api public
	 */
	
	function ws(uri, protocols, opts) {
	  var instance;
	  if (protocols) {
	    instance = new WebSocket(uri, protocols);
	  } else {
	    instance = new WebSocket(uri);
	  }
	  return instance;
	}
	
	if (WebSocket) ws.prototype = WebSocket.prototype;


/***/ },
/* 4 */
/*!***********************************!*\
  !*** ./~/signalk-client/index.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	var EventEmitter = __webpack_require__(/*! eventemitter3 */ 5);
	var WebSocket = __webpack_require__(/*! ws */ 6);
	var debug = __webpack_require__(/*! debug */ 7)('signalk:client');
	
	var Promise = __webpack_require__(/*! bluebird */ 10);
	var agent = __webpack_require__(/*! superagent-promise */ 13)(__webpack_require__(/*! superagent */ 14), Promise);
	
	
	function Client(host, port) {
	  this.host = host;
	  this.port = port;
	}
	
	
	__webpack_require__(/*! util */ 17).inherits(Client, EventEmitter);
	
	
	Client.prototype.get = function(path) {
	  return agent('GET', 'http://' + this.host + ':' + this.port + '/signalk/v1/api' + path).then(function(result) {
	    return result.res.body;
	  });
	}
	
	Client.prototype.connect = function(options) {
	  debug('connect');
	  var host = this.host;
	  var port = this.port;
	  if (options) {
	    host = options.host || host;
	    port = options.port || port;
	  }
	  if (host && port) {
	    return this.connectDelta(options.host + ":" + options.port, options.onData, options.onConnect, options.onDisconnect, options.onError)
	  }
	  return this.discoverAndConnect(options);
	}
	
	Client.prototype.discoverAndConnect = function(options) {
	  debug('discoverAndConnect');
	  var that = this;
	  try {
	    var mdns = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"mdns\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	  } catch(ex) {
	    console.log("Discovery requires mdns, please install it with 'npm install mdns' or specify host and port");
	    return
	  }
	  return new Promise(function(resolve, reject) {
	    var browser = mdns.createBrowser(mdns.tcp('signalk-ws'));
	    browser.on('serviceUp', function(service) {
	      debug("Discovered signalk-ws with txtRecord:" + JSON.stringify(service.txtRecord, null, 2));
	      //TODO handle multiple discoveries
	      resolve(service);
	    });
	    debug("Starting mdns discovery");
	    browser.start();
	  }).then(function(service) {
	    that.host = service.host;
	    that.port = service.port;
	    debug("Discovered " + that.host + ":" + that.port)
	    that.emit('discovery', service);
	    return that.connectDelta(service.host + ":" + service.port, options.onData, options.onConnect, options.onDisconnect, options.onError);
	  });
	}
	
	
	Client.prototype.connectDelta = function(hostname, callback, onConnect, onDisconnect, onError) {
	  debug("Connecting to " + hostname);
	  var url = "ws://" + hostname + "/signalk/v1/stream?stream=delta&context=self";
	  if (typeof Primus != 'undefined') {
	    debug("Using Primus");
	    var signalKStream = Primus.connect(url, {
	      reconnect: {
	        maxDelay: 15000,
	        minDelay: 500,
	        retries: Infinity
	      }
	    });
	    signalKStream.on('data', callback);
	    return {
	      disconnect: function() {
	        signalKStream.destroy();
	        debug('Disconnected');
	      }
	    }
	  } else {
	    debug("Using ws");
	    var connection = new WebSocket(url);
	    connection.onopen = function(msg) {
	      debug("open");
	      if (onConnect) {
	        onConnect(connection)
	      } else {
	        var sub = '{"context":"vessels.self","subscribe":[{"path":"*"}]}';
	        connection.send(sub);
	      }
	    };
	    connection.onerror = function(error) {
	      debug("error:" + error);
	      if (onError) {
	        onError(error)
	      }
	    };
	    connection.onmessage = function(msg) {
	      callback(JSON.parse(msg.data));
	    };
	    return {
	      disconnect: function() {
	        connection.close();
	        debug('Disconnected');
	      }
	    }
	  }
	}
	
	Client.prototype.getSelf = function (host) {
	  return agent('GET', "http://" + (host || this.host + ":" + this.port) + "/signalk/v1/api/vessels/self");
	}
	
	Client.prototype.getSelfMatcher = function(host) {
	  return this.getSelf(host || this.host + ":" + this.port).then(function(result) {
	    var selfData = result.body;
	    var selfId = selfData.mmsi || selfData.uuid;
	    if (selfId) {
	      var selfContext = 'vessels.' + selfId;
	      return function(delta) {
	        return delta.context === 'self' || delta.context === 'vessels.self' || delta.context === selfContext;
	      }
	    } else {
	      return function(delta) {
	        return true;
	      }
	    }
	  });
	}
	
	function convertUpdateToHumanUnits(update) {
	  if (update.values) {
	    update.values.forEach(convertPathValueToHumanUnits)
	  }
	}
	
	function convertPathValueToHumanUnits(pathValue) {
	  if (signalkSchema.metadata[pathValue.path] && conversions[signalkSchema.metadata[pathValue.path].units]) {
	    pathValue.value = conversions[signalkSchema.metadata[pathValue.path].units].convert(pathValue.value);
	    pathValue.units = conversions[signalkSchema.metadata[pathValue.path].units].to;
	  }
	}
	
	function isDelta(msg) {
	  return typeof msg.context != "undefined"
	}
	
	function isHello(msg) {
	  return typeof msg.version != "undefined"
	}
	
	module.exports = {
	  Client: Client,
	  isDelta: isDelta,
	  isHello: isHello
	}


/***/ },
/* 5 */
/*!***************************************************!*\
  !*** ./~/signalk-client/~/eventemitter3/index.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	//
	// We store our EE objects in a plain object whose properties are event names.
	// If `Object.create(null)` is not supported we prefix the event names with a
	// `~` to make sure that the built-in object properties are not overridden or
	// used as an attack vector.
	// We also assume that `Object.create(null)` is available when the event name
	// is an ES6 Symbol.
	//
	var prefix = typeof Object.create !== 'function' ? '~' : false;
	
	/**
	 * Representation of a single EventEmitter function.
	 *
	 * @param {Function} fn Event handler to be called.
	 * @param {Mixed} context Context for function execution.
	 * @param {Boolean} once Only emit once
	 * @api private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}
	
	/**
	 * Minimal EventEmitter interface that is molded against the Node.js
	 * EventEmitter interface.
	 *
	 * @constructor
	 * @api public
	 */
	function EventEmitter() { /* Nothing to set */ }
	
	/**
	 * Holds the assigned EventEmitters by name.
	 *
	 * @type {Object}
	 * @private
	 */
	EventEmitter.prototype._events = undefined;
	
	/**
	 * Return a list of assigned event listeners.
	 *
	 * @param {String} event The events that should be listed.
	 * @param {Boolean} exists We only need to know if there are listeners.
	 * @returns {Array|Boolean}
	 * @api public
	 */
	EventEmitter.prototype.listeners = function listeners(event, exists) {
	  var evt = prefix ? prefix + event : event
	    , available = this._events && this._events[evt];
	
	  if (exists) return !!available;
	  if (!available) return [];
	  if (available.fn) return [available.fn];
	
	  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
	    ee[i] = available[i].fn;
	  }
	
	  return ee;
	};
	
	/**
	 * Emit an event to all registered event listeners.
	 *
	 * @param {String} event The name of the event.
	 * @returns {Boolean} Indication if we've emitted an event.
	 * @api public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  var evt = prefix ? prefix + event : event;
	
	  if (!this._events || !this._events[evt]) return false;
	
	  var listeners = this._events[evt]
	    , len = arguments.length
	    , args
	    , i;
	
	  if ('function' === typeof listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);
	
	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }
	
	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }
	
	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;
	
	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);
	
	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }
	
	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }
	
	  return true;
	};
	
	/**
	 * Register a new EventListener for the given event.
	 *
	 * @param {String} event Name of the event.
	 * @param {Functon} fn Callback function.
	 * @param {Mixed} context The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  var listener = new EE(fn, context || this)
	    , evt = prefix ? prefix + event : event;
	
	  if (!this._events) this._events = prefix ? {} : Object.create(null);
	  if (!this._events[evt]) this._events[evt] = listener;
	  else {
	    if (!this._events[evt].fn) this._events[evt].push(listener);
	    else this._events[evt] = [
	      this._events[evt], listener
	    ];
	  }
	
	  return this;
	};
	
	/**
	 * Add an EventListener that's only called once.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} context The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  var listener = new EE(fn, context || this, true)
	    , evt = prefix ? prefix + event : event;
	
	  if (!this._events) this._events = prefix ? {} : Object.create(null);
	  if (!this._events[evt]) this._events[evt] = listener;
	  else {
	    if (!this._events[evt].fn) this._events[evt].push(listener);
	    else this._events[evt] = [
	      this._events[evt], listener
	    ];
	  }
	
	  return this;
	};
	
	/**
	 * Remove event listeners.
	 *
	 * @param {String} event The event we want to remove.
	 * @param {Function} fn The listener that we need to find.
	 * @param {Mixed} context Only remove listeners matching this context.
	 * @param {Boolean} once Only remove once listeners.
	 * @api public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
	  var evt = prefix ? prefix + event : event;
	
	  if (!this._events || !this._events[evt]) return this;
	
	  var listeners = this._events[evt]
	    , events = [];
	
	  if (fn) {
	    if (listeners.fn) {
	      if (
	           listeners.fn !== fn
	        || (once && !listeners.once)
	        || (context && listeners.context !== context)
	      ) {
	        events.push(listeners);
	      }
	    } else {
	      for (var i = 0, length = listeners.length; i < length; i++) {
	        if (
	             listeners[i].fn !== fn
	          || (once && !listeners[i].once)
	          || (context && listeners[i].context !== context)
	        ) {
	          events.push(listeners[i]);
	        }
	      }
	    }
	  }
	
	  //
	  // Reset the array, or remove it completely if we have no more listeners.
	  //
	  if (events.length) {
	    this._events[evt] = events.length === 1 ? events[0] : events;
	  } else {
	    delete this._events[evt];
	  }
	
	  return this;
	};
	
	/**
	 * Remove all listeners or only the listeners for the specified event.
	 *
	 * @param {String} event The event want to remove all listeners for.
	 * @api public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  if (!this._events) return this;
	
	  if (event) delete this._events[prefix ? prefix + event : event];
	  else this._events = prefix ? {} : Object.create(null);
	
	  return this;
	};
	
	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;
	
	//
	// This function doesn't apply anymore.
	//
	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
	  return this;
	};
	
	//
	// Expose the prefix.
	//
	EventEmitter.prefixed = prefix;
	
	//
	// Expose the module.
	//
	if (true) {
	  module.exports = EventEmitter;
	}


/***/ },
/* 6 */
/*!**********************************************!*\
  !*** ./~/signalk-client/~/ws/lib/browser.js ***!
  \**********************************************/
/***/ function(module, exports) {

	
	/**
	 * Module dependencies.
	 */
	
	var global = (function() { return this; })();
	
	/**
	 * WebSocket constructor.
	 */
	
	var WebSocket = global.WebSocket || global.MozWebSocket;
	
	/**
	 * Module exports.
	 */
	
	module.exports = WebSocket ? ws : null;
	
	/**
	 * WebSocket constructor.
	 *
	 * The third `opts` options object gets ignored in web browsers, since it's
	 * non-standard, and throws a TypeError if passed to the constructor.
	 * See: https://github.com/einaros/ws/issues/227
	 *
	 * @param {String} uri
	 * @param {Array} protocols (optional)
	 * @param {Object) opts (optional)
	 * @api public
	 */
	
	function ws(uri, protocols, opts) {
	  var instance;
	  if (protocols) {
	    instance = new WebSocket(uri, protocols);
	  } else {
	    instance = new WebSocket(uri);
	  }
	  return instance;
	}
	
	if (WebSocket) ws.prototype = WebSocket.prototype;


/***/ },
/* 7 */
/*!*********************************************!*\
  !*** ./~/signalk-client/~/debug/browser.js ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = __webpack_require__(/*! ./debug */ 8);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};
	
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;
	
	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);
	
	  if (!useColors) return args;
	
	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));
	
	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });
	
	  args.splice(lastC, 0, c);
	  return args;
	}
	
	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	
	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	
	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	
	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}
	
	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */
	
	exports.enable(load());
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 8 */
/*!*******************************************!*\
  !*** ./~/signalk-client/~/debug/debug.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(/*! ms */ 9);
	
	/**
	 * The currently active debug mode names, and names to skip.
	 */
	
	exports.names = [];
	exports.skips = [];
	
	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */
	
	exports.formatters = {};
	
	/**
	 * Previously assigned color.
	 */
	
	var prevColor = 0;
	
	/**
	 * Previous log timestamp.
	 */
	
	var prevTime;
	
	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */
	
	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}
	
	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */
	
	function debug(namespace) {
	
	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;
	
	  // define the `enabled` version
	  function enabled() {
	
	    var self = enabled;
	
	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;
	
	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();
	
	    var args = Array.prototype.slice.call(arguments);
	
	    args[0] = exports.coerce(args[0]);
	
	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }
	
	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);
	
	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });
	
	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;
	
	  var fn = exports.enabled(namespace) ? enabled : disabled;
	
	  fn.namespace = namespace;
	
	  return fn;
	}
	
	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */
	
	function enable(namespaces) {
	  exports.save(namespaces);
	
	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;
	
	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}
	
	/**
	 * Disable debug output.
	 *
	 * @api public
	 */
	
	function disable() {
	  exports.enable('');
	}
	
	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */
	
	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */
	
	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 9 */
/*!************************************************!*\
  !*** ./~/signalk-client/~/debug/~/ms/index.js ***!
  \************************************************/
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */
	
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 10 */
/*!************************************************************!*\
  !*** ./~/signalk-client/~/bluebird/js/browser/bluebird.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global, setImmediate) {/* @preserve
	 * The MIT License (MIT)
	 * 
	 * Copyright (c) 2013-2015 Petka Antonov
	 * 
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 * 
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 * 
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 * 
	 */
	/**
	 * bluebird build version 2.10.2
	 * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, cancel, using, filter, any, each, timers
	*/
	!function(e){if(true)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Promise=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise) {
	var SomePromiseArray = Promise._SomePromiseArray;
	function any(promises) {
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(1);
	    ret.setUnwrap();
	    ret.init();
	    return promise;
	}
	
	Promise.any = function (promises) {
	    return any(promises);
	};
	
	Promise.prototype.any = function () {
	    return any(this);
	};
	
	};
	
	},{}],2:[function(_dereq_,module,exports){
	"use strict";
	var firstLineError;
	try {throw new Error(); } catch (e) {firstLineError = e;}
	var schedule = _dereq_("./schedule.js");
	var Queue = _dereq_("./queue.js");
	var util = _dereq_("./util.js");
	
	function Async() {
	    this._isTickUsed = false;
	    this._lateQueue = new Queue(16);
	    this._normalQueue = new Queue(16);
	    this._trampolineEnabled = true;
	    var self = this;
	    this.drainQueues = function () {
	        self._drainQueues();
	    };
	    this._schedule =
	        schedule.isStatic ? schedule(this.drainQueues) : schedule;
	}
	
	Async.prototype.disableTrampolineIfNecessary = function() {
	    if (util.hasDevTools) {
	        this._trampolineEnabled = false;
	    }
	};
	
	Async.prototype.enableTrampoline = function() {
	    if (!this._trampolineEnabled) {
	        this._trampolineEnabled = true;
	        this._schedule = function(fn) {
	            setTimeout(fn, 0);
	        };
	    }
	};
	
	Async.prototype.haveItemsQueued = function () {
	    return this._normalQueue.length() > 0;
	};
	
	Async.prototype.throwLater = function(fn, arg) {
	    if (arguments.length === 1) {
	        arg = fn;
	        fn = function () { throw arg; };
	    }
	    if (typeof setTimeout !== "undefined") {
	        setTimeout(function() {
	            fn(arg);
	        }, 0);
	    } else try {
	        this._schedule(function() {
	            fn(arg);
	        });
	    } catch (e) {
	        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/m3OTXk\u000a");
	    }
	};
	
	function AsyncInvokeLater(fn, receiver, arg) {
	    this._lateQueue.push(fn, receiver, arg);
	    this._queueTick();
	}
	
	function AsyncInvoke(fn, receiver, arg) {
	    this._normalQueue.push(fn, receiver, arg);
	    this._queueTick();
	}
	
	function AsyncSettlePromises(promise) {
	    this._normalQueue._pushOne(promise);
	    this._queueTick();
	}
	
	if (!util.hasDevTools) {
	    Async.prototype.invokeLater = AsyncInvokeLater;
	    Async.prototype.invoke = AsyncInvoke;
	    Async.prototype.settlePromises = AsyncSettlePromises;
	} else {
	    if (schedule.isStatic) {
	        schedule = function(fn) { setTimeout(fn, 0); };
	    }
	    Async.prototype.invokeLater = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvokeLater.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                setTimeout(function() {
	                    fn.call(receiver, arg);
	                }, 100);
	            });
	        }
	    };
	
	    Async.prototype.invoke = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvoke.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                fn.call(receiver, arg);
	            });
	        }
	    };
	
	    Async.prototype.settlePromises = function(promise) {
	        if (this._trampolineEnabled) {
	            AsyncSettlePromises.call(this, promise);
	        } else {
	            this._schedule(function() {
	                promise._settlePromises();
	            });
	        }
	    };
	}
	
	Async.prototype.invokeFirst = function (fn, receiver, arg) {
	    this._normalQueue.unshift(fn, receiver, arg);
	    this._queueTick();
	};
	
	Async.prototype._drainQueue = function(queue) {
	    while (queue.length() > 0) {
	        var fn = queue.shift();
	        if (typeof fn !== "function") {
	            fn._settlePromises();
	            continue;
	        }
	        var receiver = queue.shift();
	        var arg = queue.shift();
	        fn.call(receiver, arg);
	    }
	};
	
	Async.prototype._drainQueues = function () {
	    this._drainQueue(this._normalQueue);
	    this._reset();
	    this._drainQueue(this._lateQueue);
	};
	
	Async.prototype._queueTick = function () {
	    if (!this._isTickUsed) {
	        this._isTickUsed = true;
	        this._schedule(this.drainQueues);
	    }
	};
	
	Async.prototype._reset = function () {
	    this._isTickUsed = false;
	};
	
	module.exports = new Async();
	module.exports.firstLineError = firstLineError;
	
	},{"./queue.js":28,"./schedule.js":31,"./util.js":38}],3:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise) {
	var rejectThis = function(_, e) {
	    this._reject(e);
	};
	
	var targetRejected = function(e, context) {
	    context.promiseRejectionQueued = true;
	    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
	};
	
	var bindingResolved = function(thisArg, context) {
	    if (this._isPending()) {
	        this._resolveCallback(context.target);
	    }
	};
	
	var bindingRejected = function(e, context) {
	    if (!context.promiseRejectionQueued) this._reject(e);
	};
	
	Promise.prototype.bind = function (thisArg) {
	    var maybePromise = tryConvertToPromise(thisArg);
	    var ret = new Promise(INTERNAL);
	    ret._propagateFrom(this, 1);
	    var target = this._target();
	
	    ret._setBoundTo(maybePromise);
	    if (maybePromise instanceof Promise) {
	        var context = {
	            promiseRejectionQueued: false,
	            promise: ret,
	            target: target,
	            bindingPromise: maybePromise
	        };
	        target._then(INTERNAL, targetRejected, ret._progress, ret, context);
	        maybePromise._then(
	            bindingResolved, bindingRejected, ret._progress, ret, context);
	    } else {
	        ret._resolveCallback(target);
	    }
	    return ret;
	};
	
	Promise.prototype._setBoundTo = function (obj) {
	    if (obj !== undefined) {
	        this._bitField = this._bitField | 131072;
	        this._boundTo = obj;
	    } else {
	        this._bitField = this._bitField & (~131072);
	    }
	};
	
	Promise.prototype._isBound = function () {
	    return (this._bitField & 131072) === 131072;
	};
	
	Promise.bind = function (thisArg, value) {
	    var maybePromise = tryConvertToPromise(thisArg);
	    var ret = new Promise(INTERNAL);
	
	    ret._setBoundTo(maybePromise);
	    if (maybePromise instanceof Promise) {
	        maybePromise._then(function() {
	            ret._resolveCallback(value);
	        }, ret._reject, ret._progress, ret, null);
	    } else {
	        ret._resolveCallback(value);
	    }
	    return ret;
	};
	};
	
	},{}],4:[function(_dereq_,module,exports){
	"use strict";
	var old;
	if (typeof Promise !== "undefined") old = Promise;
	function noConflict() {
	    try { if (Promise === bluebird) Promise = old; }
	    catch (e) {}
	    return bluebird;
	}
	var bluebird = _dereq_("./promise.js")();
	bluebird.noConflict = noConflict;
	module.exports = bluebird;
	
	},{"./promise.js":23}],5:[function(_dereq_,module,exports){
	"use strict";
	var cr = Object.create;
	if (cr) {
	    var callerCache = cr(null);
	    var getterCache = cr(null);
	    callerCache[" size"] = getterCache[" size"] = 0;
	}
	
	module.exports = function(Promise) {
	var util = _dereq_("./util.js");
	var canEvaluate = util.canEvaluate;
	var isIdentifier = util.isIdentifier;
	
	var getMethodCaller;
	var getGetter;
	if (false) {
	var makeMethodCaller = function (methodName) {
	    return new Function("ensureMethod", "                                    \n\
	        return function(obj) {                                               \n\
	            'use strict'                                                     \n\
	            var len = this.length;                                           \n\
	            ensureMethod(obj, 'methodName');                                 \n\
	            switch(len) {                                                    \n\
	                case 1: return obj.methodName(this[0]);                      \n\
	                case 2: return obj.methodName(this[0], this[1]);             \n\
	                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
	                case 0: return obj.methodName();                             \n\
	                default:                                                     \n\
	                    return obj.methodName.apply(obj, this);                  \n\
	            }                                                                \n\
	        };                                                                   \n\
	        ".replace(/methodName/g, methodName))(ensureMethod);
	};
	
	var makeGetter = function (propertyName) {
	    return new Function("obj", "                                             \n\
	        'use strict';                                                        \n\
	        return obj.propertyName;                                             \n\
	        ".replace("propertyName", propertyName));
	};
	
	var getCompiled = function(name, compiler, cache) {
	    var ret = cache[name];
	    if (typeof ret !== "function") {
	        if (!isIdentifier(name)) {
	            return null;
	        }
	        ret = compiler(name);
	        cache[name] = ret;
	        cache[" size"]++;
	        if (cache[" size"] > 512) {
	            var keys = Object.keys(cache);
	            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
	            cache[" size"] = keys.length - 256;
	        }
	    }
	    return ret;
	};
	
	getMethodCaller = function(name) {
	    return getCompiled(name, makeMethodCaller, callerCache);
	};
	
	getGetter = function(name) {
	    return getCompiled(name, makeGetter, getterCache);
	};
	}
	
	function ensureMethod(obj, methodName) {
	    var fn;
	    if (obj != null) fn = obj[methodName];
	    if (typeof fn !== "function") {
	        var message = "Object " + util.classString(obj) + " has no method '" +
	            util.toString(methodName) + "'";
	        throw new Promise.TypeError(message);
	    }
	    return fn;
	}
	
	function caller(obj) {
	    var methodName = this.pop();
	    var fn = ensureMethod(obj, methodName);
	    return fn.apply(obj, this);
	}
	Promise.prototype.call = function (methodName) {
	    var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
	    if (false) {
	        if (canEvaluate) {
	            var maybeCaller = getMethodCaller(methodName);
	            if (maybeCaller !== null) {
	                return this._then(
	                    maybeCaller, undefined, undefined, args, undefined);
	            }
	        }
	    }
	    args.push(methodName);
	    return this._then(caller, undefined, undefined, args, undefined);
	};
	
	function namedGetter(obj) {
	    return obj[this];
	}
	function indexedGetter(obj) {
	    var index = +this;
	    if (index < 0) index = Math.max(0, index + obj.length);
	    return obj[index];
	}
	Promise.prototype.get = function (propertyName) {
	    var isIndex = (typeof propertyName === "number");
	    var getter;
	    if (!isIndex) {
	        if (canEvaluate) {
	            var maybeGetter = getGetter(propertyName);
	            getter = maybeGetter !== null ? maybeGetter : namedGetter;
	        } else {
	            getter = namedGetter;
	        }
	    } else {
	        getter = indexedGetter;
	    }
	    return this._then(getter, undefined, undefined, propertyName, undefined);
	};
	};
	
	},{"./util.js":38}],6:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise) {
	var errors = _dereq_("./errors.js");
	var async = _dereq_("./async.js");
	var CancellationError = errors.CancellationError;
	
	Promise.prototype._cancel = function (reason) {
	    if (!this.isCancellable()) return this;
	    var parent;
	    var promiseToReject = this;
	    while ((parent = promiseToReject._cancellationParent) !== undefined &&
	        parent.isCancellable()) {
	        promiseToReject = parent;
	    }
	    this._unsetCancellable();
	    promiseToReject._target()._rejectCallback(reason, false, true);
	};
	
	Promise.prototype.cancel = function (reason) {
	    if (!this.isCancellable()) return this;
	    if (reason === undefined) reason = new CancellationError();
	    async.invokeLater(this._cancel, this, reason);
	    return this;
	};
	
	Promise.prototype.cancellable = function () {
	    if (this._cancellable()) return this;
	    async.enableTrampoline();
	    this._setCancellable();
	    this._cancellationParent = undefined;
	    return this;
	};
	
	Promise.prototype.uncancellable = function () {
	    var ret = this.then();
	    ret._unsetCancellable();
	    return ret;
	};
	
	Promise.prototype.fork = function (didFulfill, didReject, didProgress) {
	    var ret = this._then(didFulfill, didReject, didProgress,
	                         undefined, undefined);
	
	    ret._setCancellable();
	    ret._cancellationParent = undefined;
	    return ret;
	};
	};
	
	},{"./async.js":2,"./errors.js":13}],7:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function() {
	var async = _dereq_("./async.js");
	var util = _dereq_("./util.js");
	var bluebirdFramePattern =
	    /[\\\/]bluebird[\\\/]js[\\\/](main|debug|zalgo|instrumented)/;
	var stackFramePattern = null;
	var formatStack = null;
	var indentStackFrames = false;
	var warn;
	
	function CapturedTrace(parent) {
	    this._parent = parent;
	    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
	    captureStackTrace(this, CapturedTrace);
	    if (length > 32) this.uncycle();
	}
	util.inherits(CapturedTrace, Error);
	
	CapturedTrace.prototype.uncycle = function() {
	    var length = this._length;
	    if (length < 2) return;
	    var nodes = [];
	    var stackToIndex = {};
	
	    for (var i = 0, node = this; node !== undefined; ++i) {
	        nodes.push(node);
	        node = node._parent;
	    }
	    length = this._length = i;
	    for (var i = length - 1; i >= 0; --i) {
	        var stack = nodes[i].stack;
	        if (stackToIndex[stack] === undefined) {
	            stackToIndex[stack] = i;
	        }
	    }
	    for (var i = 0; i < length; ++i) {
	        var currentStack = nodes[i].stack;
	        var index = stackToIndex[currentStack];
	        if (index !== undefined && index !== i) {
	            if (index > 0) {
	                nodes[index - 1]._parent = undefined;
	                nodes[index - 1]._length = 1;
	            }
	            nodes[i]._parent = undefined;
	            nodes[i]._length = 1;
	            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;
	
	            if (index < length - 1) {
	                cycleEdgeNode._parent = nodes[index + 1];
	                cycleEdgeNode._parent.uncycle();
	                cycleEdgeNode._length =
	                    cycleEdgeNode._parent._length + 1;
	            } else {
	                cycleEdgeNode._parent = undefined;
	                cycleEdgeNode._length = 1;
	            }
	            var currentChildLength = cycleEdgeNode._length + 1;
	            for (var j = i - 2; j >= 0; --j) {
	                nodes[j]._length = currentChildLength;
	                currentChildLength++;
	            }
	            return;
	        }
	    }
	};
	
	CapturedTrace.prototype.parent = function() {
	    return this._parent;
	};
	
	CapturedTrace.prototype.hasParent = function() {
	    return this._parent !== undefined;
	};
	
	CapturedTrace.prototype.attachExtraTrace = function(error) {
	    if (error.__stackCleaned__) return;
	    this.uncycle();
	    var parsed = CapturedTrace.parseStackAndMessage(error);
	    var message = parsed.message;
	    var stacks = [parsed.stack];
	
	    var trace = this;
	    while (trace !== undefined) {
	        stacks.push(cleanStack(trace.stack.split("\n")));
	        trace = trace._parent;
	    }
	    removeCommonRoots(stacks);
	    removeDuplicateOrEmptyJumps(stacks);
	    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
	    util.notEnumerableProp(error, "__stackCleaned__", true);
	};
	
	function reconstructStack(message, stacks) {
	    for (var i = 0; i < stacks.length - 1; ++i) {
	        stacks[i].push("From previous event:");
	        stacks[i] = stacks[i].join("\n");
	    }
	    if (i < stacks.length) {
	        stacks[i] = stacks[i].join("\n");
	    }
	    return message + "\n" + stacks.join("\n");
	}
	
	function removeDuplicateOrEmptyJumps(stacks) {
	    for (var i = 0; i < stacks.length; ++i) {
	        if (stacks[i].length === 0 ||
	            ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
	            stacks.splice(i, 1);
	            i--;
	        }
	    }
	}
	
	function removeCommonRoots(stacks) {
	    var current = stacks[0];
	    for (var i = 1; i < stacks.length; ++i) {
	        var prev = stacks[i];
	        var currentLastIndex = current.length - 1;
	        var currentLastLine = current[currentLastIndex];
	        var commonRootMeetPoint = -1;
	
	        for (var j = prev.length - 1; j >= 0; --j) {
	            if (prev[j] === currentLastLine) {
	                commonRootMeetPoint = j;
	                break;
	            }
	        }
	
	        for (var j = commonRootMeetPoint; j >= 0; --j) {
	            var line = prev[j];
	            if (current[currentLastIndex] === line) {
	                current.pop();
	                currentLastIndex--;
	            } else {
	                break;
	            }
	        }
	        current = prev;
	    }
	}
	
	function cleanStack(stack) {
	    var ret = [];
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        var isTraceLine = stackFramePattern.test(line) ||
	            "    (No stack trace)" === line;
	        var isInternalFrame = isTraceLine && shouldIgnore(line);
	        if (isTraceLine && !isInternalFrame) {
	            if (indentStackFrames && line.charAt(0) !== " ") {
	                line = "    " + line;
	            }
	            ret.push(line);
	        }
	    }
	    return ret;
	}
	
	function stackFramesAsArray(error) {
	    var stack = error.stack.replace(/\s+$/g, "").split("\n");
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
	            break;
	        }
	    }
	    if (i > 0) {
	        stack = stack.slice(i);
	    }
	    return stack;
	}
	
	CapturedTrace.parseStackAndMessage = function(error) {
	    var stack = error.stack;
	    var message = error.toString();
	    stack = typeof stack === "string" && stack.length > 0
	                ? stackFramesAsArray(error) : ["    (No stack trace)"];
	    return {
	        message: message,
	        stack: cleanStack(stack)
	    };
	};
	
	CapturedTrace.formatAndLogError = function(error, title) {
	    if (typeof console !== "undefined") {
	        var message;
	        if (typeof error === "object" || typeof error === "function") {
	            var stack = error.stack;
	            message = title + formatStack(stack, error);
	        } else {
	            message = title + String(error);
	        }
	        if (typeof warn === "function") {
	            warn(message);
	        } else if (typeof console.log === "function" ||
	            typeof console.log === "object") {
	            console.log(message);
	        }
	    }
	};
	
	CapturedTrace.unhandledRejection = function (reason) {
	    CapturedTrace.formatAndLogError(reason, "^--- With additional stack trace: ");
	};
	
	CapturedTrace.isSupported = function () {
	    return typeof captureStackTrace === "function";
	};
	
	CapturedTrace.fireRejectionEvent =
	function(name, localHandler, reason, promise) {
	    var localEventFired = false;
	    try {
	        if (typeof localHandler === "function") {
	            localEventFired = true;
	            if (name === "rejectionHandled") {
	                localHandler(promise);
	            } else {
	                localHandler(reason, promise);
	            }
	        }
	    } catch (e) {
	        async.throwLater(e);
	    }
	
	    var globalEventFired = false;
	    try {
	        globalEventFired = fireGlobalEvent(name, reason, promise);
	    } catch (e) {
	        globalEventFired = true;
	        async.throwLater(e);
	    }
	
	    var domEventFired = false;
	    if (fireDomEvent) {
	        try {
	            domEventFired = fireDomEvent(name.toLowerCase(), {
	                reason: reason,
	                promise: promise
	            });
	        } catch (e) {
	            domEventFired = true;
	            async.throwLater(e);
	        }
	    }
	
	    if (!globalEventFired && !localEventFired && !domEventFired &&
	        name === "unhandledRejection") {
	        CapturedTrace.formatAndLogError(reason, "Unhandled rejection ");
	    }
	};
	
	function formatNonError(obj) {
	    var str;
	    if (typeof obj === "function") {
	        str = "[function " +
	            (obj.name || "anonymous") +
	            "]";
	    } else {
	        str = obj.toString();
	        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
	        if (ruselessToString.test(str)) {
	            try {
	                var newStr = JSON.stringify(obj);
	                str = newStr;
	            }
	            catch(e) {
	
	            }
	        }
	        if (str.length === 0) {
	            str = "(empty array)";
	        }
	    }
	    return ("(<" + snip(str) + ">, no stack trace)");
	}
	
	function snip(str) {
	    var maxChars = 41;
	    if (str.length < maxChars) {
	        return str;
	    }
	    return str.substr(0, maxChars - 3) + "...";
	}
	
	var shouldIgnore = function() { return false; };
	var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
	function parseLineInfo(line) {
	    var matches = line.match(parseLineInfoRegex);
	    if (matches) {
	        return {
	            fileName: matches[1],
	            line: parseInt(matches[2], 10)
	        };
	    }
	}
	CapturedTrace.setBounds = function(firstLineError, lastLineError) {
	    if (!CapturedTrace.isSupported()) return;
	    var firstStackLines = firstLineError.stack.split("\n");
	    var lastStackLines = lastLineError.stack.split("\n");
	    var firstIndex = -1;
	    var lastIndex = -1;
	    var firstFileName;
	    var lastFileName;
	    for (var i = 0; i < firstStackLines.length; ++i) {
	        var result = parseLineInfo(firstStackLines[i]);
	        if (result) {
	            firstFileName = result.fileName;
	            firstIndex = result.line;
	            break;
	        }
	    }
	    for (var i = 0; i < lastStackLines.length; ++i) {
	        var result = parseLineInfo(lastStackLines[i]);
	        if (result) {
	            lastFileName = result.fileName;
	            lastIndex = result.line;
	            break;
	        }
	    }
	    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
	        firstFileName !== lastFileName || firstIndex >= lastIndex) {
	        return;
	    }
	
	    shouldIgnore = function(line) {
	        if (bluebirdFramePattern.test(line)) return true;
	        var info = parseLineInfo(line);
	        if (info) {
	            if (info.fileName === firstFileName &&
	                (firstIndex <= info.line && info.line <= lastIndex)) {
	                return true;
	            }
	        }
	        return false;
	    };
	};
	
	var captureStackTrace = (function stackDetection() {
	    var v8stackFramePattern = /^\s*at\s*/;
	    var v8stackFormatter = function(stack, error) {
	        if (typeof stack === "string") return stack;
	
	        if (error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };
	
	    if (typeof Error.stackTraceLimit === "number" &&
	        typeof Error.captureStackTrace === "function") {
	        Error.stackTraceLimit = Error.stackTraceLimit + 6;
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        var captureStackTrace = Error.captureStackTrace;
	
	        shouldIgnore = function(line) {
	            return bluebirdFramePattern.test(line);
	        };
	        return function(receiver, ignoreUntil) {
	            Error.stackTraceLimit = Error.stackTraceLimit + 6;
	            captureStackTrace(receiver, ignoreUntil);
	            Error.stackTraceLimit = Error.stackTraceLimit - 6;
	        };
	    }
	    var err = new Error();
	
	    if (typeof err.stack === "string" &&
	        err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
	        stackFramePattern = /@/;
	        formatStack = v8stackFormatter;
	        indentStackFrames = true;
	        return function captureStackTrace(o) {
	            o.stack = new Error().stack;
	        };
	    }
	
	    var hasStackAfterThrow;
	    try { throw new Error(); }
	    catch(e) {
	        hasStackAfterThrow = ("stack" in e);
	    }
	    if (!("stack" in err) && hasStackAfterThrow &&
	        typeof Error.stackTraceLimit === "number") {
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        return function captureStackTrace(o) {
	            Error.stackTraceLimit = Error.stackTraceLimit + 6;
	            try { throw new Error(); }
	            catch(e) { o.stack = e.stack; }
	            Error.stackTraceLimit = Error.stackTraceLimit - 6;
	        };
	    }
	
	    formatStack = function(stack, error) {
	        if (typeof stack === "string") return stack;
	
	        if ((typeof error === "object" ||
	            typeof error === "function") &&
	            error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };
	
	    return null;
	
	})([]);
	
	var fireDomEvent;
	var fireGlobalEvent = (function() {
	    if (util.isNode) {
	        return function(name, reason, promise) {
	            if (name === "rejectionHandled") {
	                return process.emit(name, promise);
	            } else {
	                return process.emit(name, reason, promise);
	            }
	        };
	    } else {
	        var customEventWorks = false;
	        var anyEventWorks = true;
	        try {
	            var ev = new self.CustomEvent("test");
	            customEventWorks = ev instanceof CustomEvent;
	        } catch (e) {}
	        if (!customEventWorks) {
	            try {
	                var event = document.createEvent("CustomEvent");
	                event.initCustomEvent("testingtheevent", false, true, {});
	                self.dispatchEvent(event);
	            } catch (e) {
	                anyEventWorks = false;
	            }
	        }
	        if (anyEventWorks) {
	            fireDomEvent = function(type, detail) {
	                var event;
	                if (customEventWorks) {
	                    event = new self.CustomEvent(type, {
	                        detail: detail,
	                        bubbles: false,
	                        cancelable: true
	                    });
	                } else if (self.dispatchEvent) {
	                    event = document.createEvent("CustomEvent");
	                    event.initCustomEvent(type, false, true, detail);
	                }
	
	                return event ? !self.dispatchEvent(event) : false;
	            };
	        }
	
	        var toWindowMethodNameMap = {};
	        toWindowMethodNameMap["unhandledRejection"] = ("on" +
	            "unhandledRejection").toLowerCase();
	        toWindowMethodNameMap["rejectionHandled"] = ("on" +
	            "rejectionHandled").toLowerCase();
	
	        return function(name, reason, promise) {
	            var methodName = toWindowMethodNameMap[name];
	            var method = self[methodName];
	            if (!method) return false;
	            if (name === "rejectionHandled") {
	                method.call(self, promise);
	            } else {
	                method.call(self, reason, promise);
	            }
	            return true;
	        };
	    }
	})();
	
	if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
	    warn = function (message) {
	        console.warn(message);
	    };
	    if (util.isNode && process.stderr.isTTY) {
	        warn = function(message) {
	            process.stderr.write("\u001b[31m" + message + "\u001b[39m\n");
	        };
	    } else if (!util.isNode && typeof (new Error().stack) === "string") {
	        warn = function(message) {
	            console.warn("%c" + message, "color: red");
	        };
	    }
	}
	
	return CapturedTrace;
	};
	
	},{"./async.js":2,"./util.js":38}],8:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(NEXT_FILTER) {
	var util = _dereq_("./util.js");
	var errors = _dereq_("./errors.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var keys = _dereq_("./es5.js").keys;
	var TypeError = errors.TypeError;
	
	function CatchFilter(instances, callback, promise) {
	    this._instances = instances;
	    this._callback = callback;
	    this._promise = promise;
	}
	
	function safePredicate(predicate, e) {
	    var safeObject = {};
	    var retfilter = tryCatch(predicate).call(safeObject, e);
	
	    if (retfilter === errorObj) return retfilter;
	
	    var safeKeys = keys(safeObject);
	    if (safeKeys.length) {
	        errorObj.e = new TypeError("Catch filter must inherit from Error or be a simple predicate function\u000a\u000a    See http://goo.gl/o84o68\u000a");
	        return errorObj;
	    }
	    return retfilter;
	}
	
	CatchFilter.prototype.doFilter = function (e) {
	    var cb = this._callback;
	    var promise = this._promise;
	    var boundTo = promise._boundValue();
	    for (var i = 0, len = this._instances.length; i < len; ++i) {
	        var item = this._instances[i];
	        var itemIsErrorType = item === Error ||
	            (item != null && item.prototype instanceof Error);
	
	        if (itemIsErrorType && e instanceof item) {
	            var ret = tryCatch(cb).call(boundTo, e);
	            if (ret === errorObj) {
	                NEXT_FILTER.e = ret.e;
	                return NEXT_FILTER;
	            }
	            return ret;
	        } else if (typeof item === "function" && !itemIsErrorType) {
	            var shouldHandle = safePredicate(item, e);
	            if (shouldHandle === errorObj) {
	                e = errorObj.e;
	                break;
	            } else if (shouldHandle) {
	                var ret = tryCatch(cb).call(boundTo, e);
	                if (ret === errorObj) {
	                    NEXT_FILTER.e = ret.e;
	                    return NEXT_FILTER;
	                }
	                return ret;
	            }
	        }
	    }
	    NEXT_FILTER.e = e;
	    return NEXT_FILTER;
	};
	
	return CatchFilter;
	};
	
	},{"./errors.js":13,"./es5.js":14,"./util.js":38}],9:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, CapturedTrace, isDebugging) {
	var contextStack = [];
	function Context() {
	    this._trace = new CapturedTrace(peekContext());
	}
	Context.prototype._pushContext = function () {
	    if (!isDebugging()) return;
	    if (this._trace !== undefined) {
	        contextStack.push(this._trace);
	    }
	};
	
	Context.prototype._popContext = function () {
	    if (!isDebugging()) return;
	    if (this._trace !== undefined) {
	        contextStack.pop();
	    }
	};
	
	function createContext() {
	    if (isDebugging()) return new Context();
	}
	
	function peekContext() {
	    var lastIndex = contextStack.length - 1;
	    if (lastIndex >= 0) {
	        return contextStack[lastIndex];
	    }
	    return undefined;
	}
	
	Promise.prototype._peekContext = peekContext;
	Promise.prototype._pushContext = Context.prototype._pushContext;
	Promise.prototype._popContext = Context.prototype._popContext;
	
	return createContext;
	};
	
	},{}],10:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, CapturedTrace) {
	var getDomain = Promise._getDomain;
	var async = _dereq_("./async.js");
	var Warning = _dereq_("./errors.js").Warning;
	var util = _dereq_("./util.js");
	var canAttachTrace = util.canAttachTrace;
	var unhandledRejectionHandled;
	var possiblyUnhandledRejection;
	var debugging = false || (util.isNode &&
	                    (!!process.env["BLUEBIRD_DEBUG"] ||
	                     process.env["NODE_ENV"] === "development"));
	
	if (util.isNode && process.env["BLUEBIRD_DEBUG"] == 0) debugging = false;
	
	if (debugging) {
	    async.disableTrampolineIfNecessary();
	}
	
	Promise.prototype._ignoreRejections = function() {
	    this._unsetRejectionIsUnhandled();
	    this._bitField = this._bitField | 16777216;
	};
	
	Promise.prototype._ensurePossibleRejectionHandled = function () {
	    if ((this._bitField & 16777216) !== 0) return;
	    this._setRejectionIsUnhandled();
	    async.invokeLater(this._notifyUnhandledRejection, this, undefined);
	};
	
	Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
	    CapturedTrace.fireRejectionEvent("rejectionHandled",
	                                  unhandledRejectionHandled, undefined, this);
	};
	
	Promise.prototype._notifyUnhandledRejection = function () {
	    if (this._isRejectionUnhandled()) {
	        var reason = this._getCarriedStackTrace() || this._settledValue;
	        this._setUnhandledRejectionIsNotified();
	        CapturedTrace.fireRejectionEvent("unhandledRejection",
	                                      possiblyUnhandledRejection, reason, this);
	    }
	};
	
	Promise.prototype._setUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField | 524288;
	};
	
	Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField & (~524288);
	};
	
	Promise.prototype._isUnhandledRejectionNotified = function () {
	    return (this._bitField & 524288) > 0;
	};
	
	Promise.prototype._setRejectionIsUnhandled = function () {
	    this._bitField = this._bitField | 2097152;
	};
	
	Promise.prototype._unsetRejectionIsUnhandled = function () {
	    this._bitField = this._bitField & (~2097152);
	    if (this._isUnhandledRejectionNotified()) {
	        this._unsetUnhandledRejectionIsNotified();
	        this._notifyUnhandledRejectionIsHandled();
	    }
	};
	
	Promise.prototype._isRejectionUnhandled = function () {
	    return (this._bitField & 2097152) > 0;
	};
	
	Promise.prototype._setCarriedStackTrace = function (capturedTrace) {
	    this._bitField = this._bitField | 1048576;
	    this._fulfillmentHandler0 = capturedTrace;
	};
	
	Promise.prototype._isCarryingStackTrace = function () {
	    return (this._bitField & 1048576) > 0;
	};
	
	Promise.prototype._getCarriedStackTrace = function () {
	    return this._isCarryingStackTrace()
	        ? this._fulfillmentHandler0
	        : undefined;
	};
	
	Promise.prototype._captureStackTrace = function () {
	    if (debugging) {
	        this._trace = new CapturedTrace(this._peekContext());
	    }
	    return this;
	};
	
	Promise.prototype._attachExtraTrace = function (error, ignoreSelf) {
	    if (debugging && canAttachTrace(error)) {
	        var trace = this._trace;
	        if (trace !== undefined) {
	            if (ignoreSelf) trace = trace._parent;
	        }
	        if (trace !== undefined) {
	            trace.attachExtraTrace(error);
	        } else if (!error.__stackCleaned__) {
	            var parsed = CapturedTrace.parseStackAndMessage(error);
	            util.notEnumerableProp(error, "stack",
	                parsed.message + "\n" + parsed.stack.join("\n"));
	            util.notEnumerableProp(error, "__stackCleaned__", true);
	        }
	    }
	};
	
	Promise.prototype._warn = function(message) {
	    var warning = new Warning(message);
	    var ctx = this._peekContext();
	    if (ctx) {
	        ctx.attachExtraTrace(warning);
	    } else {
	        var parsed = CapturedTrace.parseStackAndMessage(warning);
	        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
	    }
	    CapturedTrace.formatAndLogError(warning, "");
	};
	
	Promise.onPossiblyUnhandledRejection = function (fn) {
	    var domain = getDomain();
	    possiblyUnhandledRejection =
	        typeof fn === "function" ? (domain === null ? fn : domain.bind(fn))
	                                 : undefined;
	};
	
	Promise.onUnhandledRejectionHandled = function (fn) {
	    var domain = getDomain();
	    unhandledRejectionHandled =
	        typeof fn === "function" ? (domain === null ? fn : domain.bind(fn))
	                                 : undefined;
	};
	
	Promise.longStackTraces = function () {
	    if (async.haveItemsQueued() &&
	        debugging === false
	   ) {
	        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/DT1qyG\u000a");
	    }
	    debugging = CapturedTrace.isSupported();
	    if (debugging) {
	        async.disableTrampolineIfNecessary();
	    }
	};
	
	Promise.hasLongStackTraces = function () {
	    return debugging && CapturedTrace.isSupported();
	};
	
	if (!CapturedTrace.isSupported()) {
	    Promise.longStackTraces = function(){};
	    debugging = false;
	}
	
	return function() {
	    return debugging;
	};
	};
	
	},{"./async.js":2,"./errors.js":13,"./util.js":38}],11:[function(_dereq_,module,exports){
	"use strict";
	var util = _dereq_("./util.js");
	var isPrimitive = util.isPrimitive;
	
	module.exports = function(Promise) {
	var returner = function () {
	    return this;
	};
	var thrower = function () {
	    throw this;
	};
	var returnUndefined = function() {};
	var throwUndefined = function() {
	    throw undefined;
	};
	
	var wrapper = function (value, action) {
	    if (action === 1) {
	        return function () {
	            throw value;
	        };
	    } else if (action === 2) {
	        return function () {
	            return value;
	        };
	    }
	};
	
	
	Promise.prototype["return"] =
	Promise.prototype.thenReturn = function (value) {
	    if (value === undefined) return this.then(returnUndefined);
	
	    if (isPrimitive(value)) {
	        return this._then(
	            wrapper(value, 2),
	            undefined,
	            undefined,
	            undefined,
	            undefined
	       );
	    } else if (value instanceof Promise) {
	        value._ignoreRejections();
	    }
	    return this._then(returner, undefined, undefined, value, undefined);
	};
	
	Promise.prototype["throw"] =
	Promise.prototype.thenThrow = function (reason) {
	    if (reason === undefined) return this.then(throwUndefined);
	
	    if (isPrimitive(reason)) {
	        return this._then(
	            wrapper(reason, 1),
	            undefined,
	            undefined,
	            undefined,
	            undefined
	       );
	    }
	    return this._then(thrower, undefined, undefined, reason, undefined);
	};
	};
	
	},{"./util.js":38}],12:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseReduce = Promise.reduce;
	
	Promise.prototype.each = function (fn) {
	    return PromiseReduce(this, fn, null, INTERNAL);
	};
	
	Promise.each = function (promises, fn) {
	    return PromiseReduce(promises, fn, null, INTERNAL);
	};
	};
	
	},{}],13:[function(_dereq_,module,exports){
	"use strict";
	var es5 = _dereq_("./es5.js");
	var Objectfreeze = es5.freeze;
	var util = _dereq_("./util.js");
	var inherits = util.inherits;
	var notEnumerableProp = util.notEnumerableProp;
	
	function subError(nameProperty, defaultMessage) {
	    function SubError(message) {
	        if (!(this instanceof SubError)) return new SubError(message);
	        notEnumerableProp(this, "message",
	            typeof message === "string" ? message : defaultMessage);
	        notEnumerableProp(this, "name", nameProperty);
	        if (Error.captureStackTrace) {
	            Error.captureStackTrace(this, this.constructor);
	        } else {
	            Error.call(this);
	        }
	    }
	    inherits(SubError, Error);
	    return SubError;
	}
	
	var _TypeError, _RangeError;
	var Warning = subError("Warning", "warning");
	var CancellationError = subError("CancellationError", "cancellation error");
	var TimeoutError = subError("TimeoutError", "timeout error");
	var AggregateError = subError("AggregateError", "aggregate error");
	try {
	    _TypeError = TypeError;
	    _RangeError = RangeError;
	} catch(e) {
	    _TypeError = subError("TypeError", "type error");
	    _RangeError = subError("RangeError", "range error");
	}
	
	var methods = ("join pop push shift unshift slice filter forEach some " +
	    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");
	
	for (var i = 0; i < methods.length; ++i) {
	    if (typeof Array.prototype[methods[i]] === "function") {
	        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
	    }
	}
	
	es5.defineProperty(AggregateError.prototype, "length", {
	    value: 0,
	    configurable: false,
	    writable: true,
	    enumerable: true
	});
	AggregateError.prototype["isOperational"] = true;
	var level = 0;
	AggregateError.prototype.toString = function() {
	    var indent = Array(level * 4 + 1).join(" ");
	    var ret = "\n" + indent + "AggregateError of:" + "\n";
	    level++;
	    indent = Array(level * 4 + 1).join(" ");
	    for (var i = 0; i < this.length; ++i) {
	        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
	        var lines = str.split("\n");
	        for (var j = 0; j < lines.length; ++j) {
	            lines[j] = indent + lines[j];
	        }
	        str = lines.join("\n");
	        ret += str + "\n";
	    }
	    level--;
	    return ret;
	};
	
	function OperationalError(message) {
	    if (!(this instanceof OperationalError))
	        return new OperationalError(message);
	    notEnumerableProp(this, "name", "OperationalError");
	    notEnumerableProp(this, "message", message);
	    this.cause = message;
	    this["isOperational"] = true;
	
	    if (message instanceof Error) {
	        notEnumerableProp(this, "message", message.message);
	        notEnumerableProp(this, "stack", message.stack);
	    } else if (Error.captureStackTrace) {
	        Error.captureStackTrace(this, this.constructor);
	    }
	
	}
	inherits(OperationalError, Error);
	
	var errorTypes = Error["__BluebirdErrorTypes__"];
	if (!errorTypes) {
	    errorTypes = Objectfreeze({
	        CancellationError: CancellationError,
	        TimeoutError: TimeoutError,
	        OperationalError: OperationalError,
	        RejectionError: OperationalError,
	        AggregateError: AggregateError
	    });
	    notEnumerableProp(Error, "__BluebirdErrorTypes__", errorTypes);
	}
	
	module.exports = {
	    Error: Error,
	    TypeError: _TypeError,
	    RangeError: _RangeError,
	    CancellationError: errorTypes.CancellationError,
	    OperationalError: errorTypes.OperationalError,
	    TimeoutError: errorTypes.TimeoutError,
	    AggregateError: errorTypes.AggregateError,
	    Warning: Warning
	};
	
	},{"./es5.js":14,"./util.js":38}],14:[function(_dereq_,module,exports){
	var isES5 = (function(){
	    "use strict";
	    return this === undefined;
	})();
	
	if (isES5) {
	    module.exports = {
	        freeze: Object.freeze,
	        defineProperty: Object.defineProperty,
	        getDescriptor: Object.getOwnPropertyDescriptor,
	        keys: Object.keys,
	        names: Object.getOwnPropertyNames,
	        getPrototypeOf: Object.getPrototypeOf,
	        isArray: Array.isArray,
	        isES5: isES5,
	        propertyIsWritable: function(obj, prop) {
	            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	            return !!(!descriptor || descriptor.writable || descriptor.set);
	        }
	    };
	} else {
	    var has = {}.hasOwnProperty;
	    var str = {}.toString;
	    var proto = {}.constructor.prototype;
	
	    var ObjectKeys = function (o) {
	        var ret = [];
	        for (var key in o) {
	            if (has.call(o, key)) {
	                ret.push(key);
	            }
	        }
	        return ret;
	    };
	
	    var ObjectGetDescriptor = function(o, key) {
	        return {value: o[key]};
	    };
	
	    var ObjectDefineProperty = function (o, key, desc) {
	        o[key] = desc.value;
	        return o;
	    };
	
	    var ObjectFreeze = function (obj) {
	        return obj;
	    };
	
	    var ObjectGetPrototypeOf = function (obj) {
	        try {
	            return Object(obj).constructor.prototype;
	        }
	        catch (e) {
	            return proto;
	        }
	    };
	
	    var ArrayIsArray = function (obj) {
	        try {
	            return str.call(obj) === "[object Array]";
	        }
	        catch(e) {
	            return false;
	        }
	    };
	
	    module.exports = {
	        isArray: ArrayIsArray,
	        keys: ObjectKeys,
	        names: ObjectKeys,
	        defineProperty: ObjectDefineProperty,
	        getDescriptor: ObjectGetDescriptor,
	        freeze: ObjectFreeze,
	        getPrototypeOf: ObjectGetPrototypeOf,
	        isES5: isES5,
	        propertyIsWritable: function() {
	            return true;
	        }
	    };
	}
	
	},{}],15:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseMap = Promise.map;
	
	Promise.prototype.filter = function (fn, options) {
	    return PromiseMap(this, fn, options, INTERNAL);
	};
	
	Promise.filter = function (promises, fn, options) {
	    return PromiseMap(promises, fn, options, INTERNAL);
	};
	};
	
	},{}],16:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, NEXT_FILTER, tryConvertToPromise) {
	var util = _dereq_("./util.js");
	var isPrimitive = util.isPrimitive;
	var thrower = util.thrower;
	
	function returnThis() {
	    return this;
	}
	function throwThis() {
	    throw this;
	}
	function return$(r) {
	    return function() {
	        return r;
	    };
	}
	function throw$(r) {
	    return function() {
	        throw r;
	    };
	}
	function promisedFinally(ret, reasonOrValue, isFulfilled) {
	    var then;
	    if (isPrimitive(reasonOrValue)) {
	        then = isFulfilled ? return$(reasonOrValue) : throw$(reasonOrValue);
	    } else {
	        then = isFulfilled ? returnThis : throwThis;
	    }
	    return ret._then(then, thrower, undefined, reasonOrValue, undefined);
	}
	
	function finallyHandler(reasonOrValue) {
	    var promise = this.promise;
	    var handler = this.handler;
	
	    var ret = promise._isBound()
	                    ? handler.call(promise._boundValue())
	                    : handler();
	
	    if (ret !== undefined) {
	        var maybePromise = tryConvertToPromise(ret, promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            return promisedFinally(maybePromise, reasonOrValue,
	                                    promise.isFulfilled());
	        }
	    }
	
	    if (promise.isRejected()) {
	        NEXT_FILTER.e = reasonOrValue;
	        return NEXT_FILTER;
	    } else {
	        return reasonOrValue;
	    }
	}
	
	function tapHandler(value) {
	    var promise = this.promise;
	    var handler = this.handler;
	
	    var ret = promise._isBound()
	                    ? handler.call(promise._boundValue(), value)
	                    : handler(value);
	
	    if (ret !== undefined) {
	        var maybePromise = tryConvertToPromise(ret, promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            return promisedFinally(maybePromise, value, true);
	        }
	    }
	    return value;
	}
	
	Promise.prototype._passThroughHandler = function (handler, isFinally) {
	    if (typeof handler !== "function") return this.then();
	
	    var promiseAndHandler = {
	        promise: this,
	        handler: handler
	    };
	
	    return this._then(
	            isFinally ? finallyHandler : tapHandler,
	            isFinally ? finallyHandler : undefined, undefined,
	            promiseAndHandler, undefined);
	};
	
	Promise.prototype.lastly =
	Promise.prototype["finally"] = function (handler) {
	    return this._passThroughHandler(handler, true);
	};
	
	Promise.prototype.tap = function (handler) {
	    return this._passThroughHandler(handler, false);
	};
	};
	
	},{"./util.js":38}],17:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise,
	                          apiRejection,
	                          INTERNAL,
	                          tryConvertToPromise) {
	var errors = _dereq_("./errors.js");
	var TypeError = errors.TypeError;
	var util = _dereq_("./util.js");
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	var yieldHandlers = [];
	
	function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
	    for (var i = 0; i < yieldHandlers.length; ++i) {
	        traceParent._pushContext();
	        var result = tryCatch(yieldHandlers[i])(value);
	        traceParent._popContext();
	        if (result === errorObj) {
	            traceParent._pushContext();
	            var ret = Promise.reject(errorObj.e);
	            traceParent._popContext();
	            return ret;
	        }
	        var maybePromise = tryConvertToPromise(result, traceParent);
	        if (maybePromise instanceof Promise) return maybePromise;
	    }
	    return null;
	}
	
	function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
	    var promise = this._promise = new Promise(INTERNAL);
	    promise._captureStackTrace();
	    this._stack = stack;
	    this._generatorFunction = generatorFunction;
	    this._receiver = receiver;
	    this._generator = undefined;
	    this._yieldHandlers = typeof yieldHandler === "function"
	        ? [yieldHandler].concat(yieldHandlers)
	        : yieldHandlers;
	}
	
	PromiseSpawn.prototype.promise = function () {
	    return this._promise;
	};
	
	PromiseSpawn.prototype._run = function () {
	    this._generator = this._generatorFunction.call(this._receiver);
	    this._receiver =
	        this._generatorFunction = undefined;
	    this._next(undefined);
	};
	
	PromiseSpawn.prototype._continue = function (result) {
	    if (result === errorObj) {
	        return this._promise._rejectCallback(result.e, false, true);
	    }
	
	    var value = result.value;
	    if (result.done === true) {
	        this._promise._resolveCallback(value);
	    } else {
	        var maybePromise = tryConvertToPromise(value, this._promise);
	        if (!(maybePromise instanceof Promise)) {
	            maybePromise =
	                promiseFromYieldHandler(maybePromise,
	                                        this._yieldHandlers,
	                                        this._promise);
	            if (maybePromise === null) {
	                this._throw(
	                    new TypeError(
	                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/4Y4pDk\u000a\u000a".replace("%s", value) +
	                        "From coroutine:\u000a" +
	                        this._stack.split("\n").slice(1, -7).join("\n")
	                    )
	                );
	                return;
	            }
	        }
	        maybePromise._then(
	            this._next,
	            this._throw,
	            undefined,
	            this,
	            null
	       );
	    }
	};
	
	PromiseSpawn.prototype._throw = function (reason) {
	    this._promise._attachExtraTrace(reason);
	    this._promise._pushContext();
	    var result = tryCatch(this._generator["throw"])
	        .call(this._generator, reason);
	    this._promise._popContext();
	    this._continue(result);
	};
	
	PromiseSpawn.prototype._next = function (value) {
	    this._promise._pushContext();
	    var result = tryCatch(this._generator.next).call(this._generator, value);
	    this._promise._popContext();
	    this._continue(result);
	};
	
	Promise.coroutine = function (generatorFunction, options) {
	    if (typeof generatorFunction !== "function") {
	        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/6Vqhm0\u000a");
	    }
	    var yieldHandler = Object(options).yieldHandler;
	    var PromiseSpawn$ = PromiseSpawn;
	    var stack = new Error().stack;
	    return function () {
	        var generator = generatorFunction.apply(this, arguments);
	        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
	                                      stack);
	        spawn._generator = generator;
	        spawn._next(undefined);
	        return spawn.promise();
	    };
	};
	
	Promise.coroutine.addYieldHandler = function(fn) {
	    if (typeof fn !== "function") throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    yieldHandlers.push(fn);
	};
	
	Promise.spawn = function (generatorFunction) {
	    if (typeof generatorFunction !== "function") {
	        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/6Vqhm0\u000a");
	    }
	    var spawn = new PromiseSpawn(generatorFunction, this);
	    var ret = spawn.promise();
	    spawn._run(Promise.spawn);
	    return ret;
	};
	};
	
	},{"./errors.js":13,"./util.js":38}],18:[function(_dereq_,module,exports){
	"use strict";
	module.exports =
	function(Promise, PromiseArray, tryConvertToPromise, INTERNAL) {
	var util = _dereq_("./util.js");
	var canEvaluate = util.canEvaluate;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var reject;
	
	if (false) {
	if (canEvaluate) {
	    var thenCallback = function(i) {
	        return new Function("value", "holder", "                             \n\
	            'use strict';                                                    \n\
	            holder.pIndex = value;                                           \n\
	            holder.checkFulfillment(this);                                   \n\
	            ".replace(/Index/g, i));
	    };
	
	    var caller = function(count) {
	        var values = [];
	        for (var i = 1; i <= count; ++i) values.push("holder.p" + i);
	        return new Function("holder", "                                      \n\
	            'use strict';                                                    \n\
	            var callback = holder.fn;                                        \n\
	            return callback(values);                                         \n\
	            ".replace(/values/g, values.join(", ")));
	    };
	    var thenCallbacks = [];
	    var callers = [undefined];
	    for (var i = 1; i <= 5; ++i) {
	        thenCallbacks.push(thenCallback(i));
	        callers.push(caller(i));
	    }
	
	    var Holder = function(total, fn) {
	        this.p1 = this.p2 = this.p3 = this.p4 = this.p5 = null;
	        this.fn = fn;
	        this.total = total;
	        this.now = 0;
	    };
	
	    Holder.prototype.callers = callers;
	    Holder.prototype.checkFulfillment = function(promise) {
	        var now = this.now;
	        now++;
	        var total = this.total;
	        if (now >= total) {
	            var handler = this.callers[total];
	            promise._pushContext();
	            var ret = tryCatch(handler)(this);
	            promise._popContext();
	            if (ret === errorObj) {
	                promise._rejectCallback(ret.e, false, true);
	            } else {
	                promise._resolveCallback(ret);
	            }
	        } else {
	            this.now = now;
	        }
	    };
	
	    var reject = function (reason) {
	        this._reject(reason);
	    };
	}
	}
	
	Promise.join = function () {
	    var last = arguments.length - 1;
	    var fn;
	    if (last > 0 && typeof arguments[last] === "function") {
	        fn = arguments[last];
	        if (false) {
	            if (last < 6 && canEvaluate) {
	                var ret = new Promise(INTERNAL);
	                ret._captureStackTrace();
	                var holder = new Holder(last, fn);
	                var callbacks = thenCallbacks;
	                for (var i = 0; i < last; ++i) {
	                    var maybePromise = tryConvertToPromise(arguments[i], ret);
	                    if (maybePromise instanceof Promise) {
	                        maybePromise = maybePromise._target();
	                        if (maybePromise._isPending()) {
	                            maybePromise._then(callbacks[i], reject,
	                                               undefined, ret, holder);
	                        } else if (maybePromise._isFulfilled()) {
	                            callbacks[i].call(ret,
	                                              maybePromise._value(), holder);
	                        } else {
	                            ret._reject(maybePromise._reason());
	                        }
	                    } else {
	                        callbacks[i].call(ret, maybePromise, holder);
	                    }
	                }
	                return ret;
	            }
	        }
	    }
	    var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
	    if (fn) args.pop();
	    var ret = new PromiseArray(args).promise();
	    return fn !== undefined ? ret.spread(fn) : ret;
	};
	
	};
	
	},{"./util.js":38}],19:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL) {
	var getDomain = Promise._getDomain;
	var async = _dereq_("./async.js");
	var util = _dereq_("./util.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var PENDING = {};
	var EMPTY_ARRAY = [];
	
	function MappingPromiseArray(promises, fn, limit, _filter) {
	    this.constructor$(promises);
	    this._promise._captureStackTrace();
	    var domain = getDomain();
	    this._callback = domain === null ? fn : domain.bind(fn);
	    this._preservedValues = _filter === INTERNAL
	        ? new Array(this.length())
	        : null;
	    this._limit = limit;
	    this._inFlight = 0;
	    this._queue = limit >= 1 ? [] : EMPTY_ARRAY;
	    async.invoke(init, this, undefined);
	}
	util.inherits(MappingPromiseArray, PromiseArray);
	function init() {this._init$(undefined, -2);}
	
	MappingPromiseArray.prototype._init = function () {};
	
	MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var values = this._values;
	    var length = this.length();
	    var preservedValues = this._preservedValues;
	    var limit = this._limit;
	    if (values[index] === PENDING) {
	        values[index] = value;
	        if (limit >= 1) {
	            this._inFlight--;
	            this._drainQueue();
	            if (this._isResolved()) return;
	        }
	    } else {
	        if (limit >= 1 && this._inFlight >= limit) {
	            values[index] = value;
	            this._queue.push(index);
	            return;
	        }
	        if (preservedValues !== null) preservedValues[index] = value;
	
	        var callback = this._callback;
	        var receiver = this._promise._boundValue();
	        this._promise._pushContext();
	        var ret = tryCatch(callback).call(receiver, value, index, length);
	        this._promise._popContext();
	        if (ret === errorObj) return this._reject(ret.e);
	
	        var maybePromise = tryConvertToPromise(ret, this._promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            if (maybePromise._isPending()) {
	                if (limit >= 1) this._inFlight++;
	                values[index] = PENDING;
	                return maybePromise._proxyPromiseArray(this, index);
	            } else if (maybePromise._isFulfilled()) {
	                ret = maybePromise._value();
	            } else {
	                return this._reject(maybePromise._reason());
	            }
	        }
	        values[index] = ret;
	    }
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= length) {
	        if (preservedValues !== null) {
	            this._filter(values, preservedValues);
	        } else {
	            this._resolve(values);
	        }
	
	    }
	};
	
	MappingPromiseArray.prototype._drainQueue = function () {
	    var queue = this._queue;
	    var limit = this._limit;
	    var values = this._values;
	    while (queue.length > 0 && this._inFlight < limit) {
	        if (this._isResolved()) return;
	        var index = queue.pop();
	        this._promiseFulfilled(values[index], index);
	    }
	};
	
	MappingPromiseArray.prototype._filter = function (booleans, values) {
	    var len = values.length;
	    var ret = new Array(len);
	    var j = 0;
	    for (var i = 0; i < len; ++i) {
	        if (booleans[i]) ret[j++] = values[i];
	    }
	    ret.length = j;
	    this._resolve(ret);
	};
	
	MappingPromiseArray.prototype.preservedValues = function () {
	    return this._preservedValues;
	};
	
	function map(promises, fn, options, _filter) {
	    var limit = typeof options === "object" && options !== null
	        ? options.concurrency
	        : 0;
	    limit = typeof limit === "number" &&
	        isFinite(limit) && limit >= 1 ? limit : 0;
	    return new MappingPromiseArray(promises, fn, limit, _filter);
	}
	
	Promise.prototype.map = function (fn, options) {
	    if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	
	    return map(this, fn, options, null).promise();
	};
	
	Promise.map = function (promises, fn, options, _filter) {
	    if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    return map(promises, fn, options, _filter).promise();
	};
	
	
	};
	
	},{"./async.js":2,"./util.js":38}],20:[function(_dereq_,module,exports){
	"use strict";
	module.exports =
	function(Promise, INTERNAL, tryConvertToPromise, apiRejection) {
	var util = _dereq_("./util.js");
	var tryCatch = util.tryCatch;
	
	Promise.method = function (fn) {
	    if (typeof fn !== "function") {
	        throw new Promise.TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    }
	    return function () {
	        var ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._pushContext();
	        var value = tryCatch(fn).apply(this, arguments);
	        ret._popContext();
	        ret._resolveFromSyncValue(value);
	        return ret;
	    };
	};
	
	Promise.attempt = Promise["try"] = function (fn, args, ctx) {
	    if (typeof fn !== "function") {
	        return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    }
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._pushContext();
	    var value = util.isArray(args)
	        ? tryCatch(fn).apply(ctx, args)
	        : tryCatch(fn).call(ctx, args);
	    ret._popContext();
	    ret._resolveFromSyncValue(value);
	    return ret;
	};
	
	Promise.prototype._resolveFromSyncValue = function (value) {
	    if (value === util.errorObj) {
	        this._rejectCallback(value.e, false, true);
	    } else {
	        this._resolveCallback(value, true);
	    }
	};
	};
	
	},{"./util.js":38}],21:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise) {
	var util = _dereq_("./util.js");
	var async = _dereq_("./async.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	
	function spreadAdapter(val, nodeback) {
	    var promise = this;
	    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
	    var ret =
	        tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}
	
	function successAdapter(val, nodeback) {
	    var promise = this;
	    var receiver = promise._boundValue();
	    var ret = val === undefined
	        ? tryCatch(nodeback).call(receiver, null)
	        : tryCatch(nodeback).call(receiver, null, val);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}
	function errorAdapter(reason, nodeback) {
	    var promise = this;
	    if (!reason) {
	        var target = promise._target();
	        var newReason = target._getCarriedStackTrace();
	        newReason.cause = reason;
	        reason = newReason;
	    }
	    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}
	
	Promise.prototype.asCallback =
	Promise.prototype.nodeify = function (nodeback, options) {
	    if (typeof nodeback == "function") {
	        var adapter = successAdapter;
	        if (options !== undefined && Object(options).spread) {
	            adapter = spreadAdapter;
	        }
	        this._then(
	            adapter,
	            errorAdapter,
	            undefined,
	            this,
	            nodeback
	        );
	    }
	    return this;
	};
	};
	
	},{"./async.js":2,"./util.js":38}],22:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, PromiseArray) {
	var util = _dereq_("./util.js");
	var async = _dereq_("./async.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	
	Promise.prototype.progressed = function (handler) {
	    return this._then(undefined, undefined, handler, undefined, undefined);
	};
	
	Promise.prototype._progress = function (progressValue) {
	    if (this._isFollowingOrFulfilledOrRejected()) return;
	    this._target()._progressUnchecked(progressValue);
	
	};
	
	Promise.prototype._progressHandlerAt = function (index) {
	    return index === 0
	        ? this._progressHandler0
	        : this[(index << 2) + index - 5 + 2];
	};
	
	Promise.prototype._doProgressWith = function (progression) {
	    var progressValue = progression.value;
	    var handler = progression.handler;
	    var promise = progression.promise;
	    var receiver = progression.receiver;
	
	    var ret = tryCatch(handler).call(receiver, progressValue);
	    if (ret === errorObj) {
	        if (ret.e != null &&
	            ret.e.name !== "StopProgressPropagation") {
	            var trace = util.canAttachTrace(ret.e)
	                ? ret.e : new Error(util.toString(ret.e));
	            promise._attachExtraTrace(trace);
	            promise._progress(ret.e);
	        }
	    } else if (ret instanceof Promise) {
	        ret._then(promise._progress, null, null, promise, undefined);
	    } else {
	        promise._progress(ret);
	    }
	};
	
	
	Promise.prototype._progressUnchecked = function (progressValue) {
	    var len = this._length();
	    var progress = this._progress;
	    for (var i = 0; i < len; i++) {
	        var handler = this._progressHandlerAt(i);
	        var promise = this._promiseAt(i);
	        if (!(promise instanceof Promise)) {
	            var receiver = this._receiverAt(i);
	            if (typeof handler === "function") {
	                handler.call(receiver, progressValue, promise);
	            } else if (receiver instanceof PromiseArray &&
	                       !receiver._isResolved()) {
	                receiver._promiseProgressed(progressValue, promise);
	            }
	            continue;
	        }
	
	        if (typeof handler === "function") {
	            async.invoke(this._doProgressWith, this, {
	                handler: handler,
	                promise: promise,
	                receiver: this._receiverAt(i),
	                value: progressValue
	            });
	        } else {
	            async.invoke(progress, promise, progressValue);
	        }
	    }
	};
	};
	
	},{"./async.js":2,"./util.js":38}],23:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function() {
	var makeSelfResolutionError = function () {
	    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/LhFpo0\u000a");
	};
	var reflect = function() {
	    return new Promise.PromiseInspection(this._target());
	};
	var apiRejection = function(msg) {
	    return Promise.reject(new TypeError(msg));
	};
	
	var util = _dereq_("./util.js");
	
	var getDomain;
	if (util.isNode) {
	    getDomain = function() {
	        var ret = process.domain;
	        if (ret === undefined) ret = null;
	        return ret;
	    };
	} else {
	    getDomain = function() {
	        return null;
	    };
	}
	util.notEnumerableProp(Promise, "_getDomain", getDomain);
	
	var UNDEFINED_BINDING = {};
	var async = _dereq_("./async.js");
	var errors = _dereq_("./errors.js");
	var TypeError = Promise.TypeError = errors.TypeError;
	Promise.RangeError = errors.RangeError;
	Promise.CancellationError = errors.CancellationError;
	Promise.TimeoutError = errors.TimeoutError;
	Promise.OperationalError = errors.OperationalError;
	Promise.RejectionError = errors.OperationalError;
	Promise.AggregateError = errors.AggregateError;
	var INTERNAL = function(){};
	var APPLY = {};
	var NEXT_FILTER = {e: null};
	var tryConvertToPromise = _dereq_("./thenables.js")(Promise, INTERNAL);
	var PromiseArray =
	    _dereq_("./promise_array.js")(Promise, INTERNAL,
	                                    tryConvertToPromise, apiRejection);
	var CapturedTrace = _dereq_("./captured_trace.js")();
	var isDebugging = _dereq_("./debuggability.js")(Promise, CapturedTrace);
	 /*jshint unused:false*/
	var createContext =
	    _dereq_("./context.js")(Promise, CapturedTrace, isDebugging);
	var CatchFilter = _dereq_("./catch_filter.js")(NEXT_FILTER);
	var PromiseResolver = _dereq_("./promise_resolver.js");
	var nodebackForPromise = PromiseResolver._nodebackForPromise;
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	function Promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("the promise constructor requires a resolver function\u000a\u000a    See http://goo.gl/EC22Yn\u000a");
	    }
	    if (this.constructor !== Promise) {
	        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/KsIlge\u000a");
	    }
	    this._bitField = 0;
	    this._fulfillmentHandler0 = undefined;
	    this._rejectionHandler0 = undefined;
	    this._progressHandler0 = undefined;
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    this._settledValue = undefined;
	    if (resolver !== INTERNAL) this._resolveFromResolver(resolver);
	}
	
	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};
	
	Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
	    var len = arguments.length;
	    if (len > 1) {
	        var catchInstances = new Array(len - 1),
	            j = 0, i;
	        for (i = 0; i < len - 1; ++i) {
	            var item = arguments[i];
	            if (typeof item === "function") {
	                catchInstances[j++] = item;
	            } else {
	                return Promise.reject(
	                    new TypeError("Catch filter must inherit from Error or be a simple predicate function\u000a\u000a    See http://goo.gl/o84o68\u000a"));
	            }
	        }
	        catchInstances.length = j;
	        fn = arguments[i];
	        var catchFilter = new CatchFilter(catchInstances, fn, this);
	        return this._then(undefined, catchFilter.doFilter, undefined,
	            catchFilter, undefined);
	    }
	    return this._then(undefined, fn, undefined, undefined, undefined);
	};
	
	Promise.prototype.reflect = function () {
	    return this._then(reflect, reflect, undefined, this, undefined);
	};
	
	Promise.prototype.then = function (didFulfill, didReject, didProgress) {
	    if (isDebugging() && arguments.length > 0 &&
	        typeof didFulfill !== "function" &&
	        typeof didReject !== "function") {
	        var msg = ".then() only accepts functions but was passed: " +
	                util.classString(didFulfill);
	        if (arguments.length > 1) {
	            msg += ", " + util.classString(didReject);
	        }
	        this._warn(msg);
	    }
	    return this._then(didFulfill, didReject, didProgress,
	        undefined, undefined);
	};
	
	Promise.prototype.done = function (didFulfill, didReject, didProgress) {
	    var promise = this._then(didFulfill, didReject, didProgress,
	        undefined, undefined);
	    promise._setIsFinal();
	};
	
	Promise.prototype.spread = function (didFulfill, didReject) {
	    return this.all()._then(didFulfill, didReject, undefined, APPLY, undefined);
	};
	
	Promise.prototype.isCancellable = function () {
	    return !this.isResolved() &&
	        this._cancellable();
	};
	
	Promise.prototype.toJSON = function () {
	    var ret = {
	        isFulfilled: false,
	        isRejected: false,
	        fulfillmentValue: undefined,
	        rejectionReason: undefined
	    };
	    if (this.isFulfilled()) {
	        ret.fulfillmentValue = this.value();
	        ret.isFulfilled = true;
	    } else if (this.isRejected()) {
	        ret.rejectionReason = this.reason();
	        ret.isRejected = true;
	    }
	    return ret;
	};
	
	Promise.prototype.all = function () {
	    return new PromiseArray(this).promise();
	};
	
	Promise.prototype.error = function (fn) {
	    return this.caught(util.originatesFromRejection, fn);
	};
	
	Promise.is = function (val) {
	    return val instanceof Promise;
	};
	
	Promise.fromNode = function(fn) {
	    var ret = new Promise(INTERNAL);
	    var result = tryCatch(fn)(nodebackForPromise(ret));
	    if (result === errorObj) {
	        ret._rejectCallback(result.e, true, true);
	    }
	    return ret;
	};
	
	Promise.all = function (promises) {
	    return new PromiseArray(promises).promise();
	};
	
	Promise.defer = Promise.pending = function () {
	    var promise = new Promise(INTERNAL);
	    return new PromiseResolver(promise);
	};
	
	Promise.cast = function (obj) {
	    var ret = tryConvertToPromise(obj);
	    if (!(ret instanceof Promise)) {
	        var val = ret;
	        ret = new Promise(INTERNAL);
	        ret._fulfillUnchecked(val);
	    }
	    return ret;
	};
	
	Promise.resolve = Promise.fulfilled = Promise.cast;
	
	Promise.reject = Promise.rejected = function (reason) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._rejectCallback(reason, true);
	    return ret;
	};
	
	Promise.setScheduler = function(fn) {
	    if (typeof fn !== "function") throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    var prev = async._schedule;
	    async._schedule = fn;
	    return prev;
	};
	
	Promise.prototype._then = function (
	    didFulfill,
	    didReject,
	    didProgress,
	    receiver,
	    internalData
	) {
	    var haveInternalData = internalData !== undefined;
	    var ret = haveInternalData ? internalData : new Promise(INTERNAL);
	
	    if (!haveInternalData) {
	        ret._propagateFrom(this, 4 | 1);
	        ret._captureStackTrace();
	    }
	
	    var target = this._target();
	    if (target !== this) {
	        if (receiver === undefined) receiver = this._boundTo;
	        if (!haveInternalData) ret._setIsMigrated();
	    }
	
	    var callbackIndex = target._addCallbacks(didFulfill,
	                                             didReject,
	                                             didProgress,
	                                             ret,
	                                             receiver,
	                                             getDomain());
	
	    if (target._isResolved() && !target._isSettlePromisesQueued()) {
	        async.invoke(
	            target._settlePromiseAtPostResolution, target, callbackIndex);
	    }
	
	    return ret;
	};
	
	Promise.prototype._settlePromiseAtPostResolution = function (index) {
	    if (this._isRejectionUnhandled()) this._unsetRejectionIsUnhandled();
	    this._settlePromiseAt(index);
	};
	
	Promise.prototype._length = function () {
	    return this._bitField & 131071;
	};
	
	Promise.prototype._isFollowingOrFulfilledOrRejected = function () {
	    return (this._bitField & 939524096) > 0;
	};
	
	Promise.prototype._isFollowing = function () {
	    return (this._bitField & 536870912) === 536870912;
	};
	
	Promise.prototype._setLength = function (len) {
	    this._bitField = (this._bitField & -131072) |
	        (len & 131071);
	};
	
	Promise.prototype._setFulfilled = function () {
	    this._bitField = this._bitField | 268435456;
	};
	
	Promise.prototype._setRejected = function () {
	    this._bitField = this._bitField | 134217728;
	};
	
	Promise.prototype._setFollowing = function () {
	    this._bitField = this._bitField | 536870912;
	};
	
	Promise.prototype._setIsFinal = function () {
	    this._bitField = this._bitField | 33554432;
	};
	
	Promise.prototype._isFinal = function () {
	    return (this._bitField & 33554432) > 0;
	};
	
	Promise.prototype._cancellable = function () {
	    return (this._bitField & 67108864) > 0;
	};
	
	Promise.prototype._setCancellable = function () {
	    this._bitField = this._bitField | 67108864;
	};
	
	Promise.prototype._unsetCancellable = function () {
	    this._bitField = this._bitField & (~67108864);
	};
	
	Promise.prototype._setIsMigrated = function () {
	    this._bitField = this._bitField | 4194304;
	};
	
	Promise.prototype._unsetIsMigrated = function () {
	    this._bitField = this._bitField & (~4194304);
	};
	
	Promise.prototype._isMigrated = function () {
	    return (this._bitField & 4194304) > 0;
	};
	
	Promise.prototype._receiverAt = function (index) {
	    var ret = index === 0
	        ? this._receiver0
	        : this[
	            index * 5 - 5 + 4];
	    if (ret === UNDEFINED_BINDING) {
	        return undefined;
	    } else if (ret === undefined && this._isBound()) {
	        return this._boundValue();
	    }
	    return ret;
	};
	
	Promise.prototype._promiseAt = function (index) {
	    return index === 0
	        ? this._promise0
	        : this[index * 5 - 5 + 3];
	};
	
	Promise.prototype._fulfillmentHandlerAt = function (index) {
	    return index === 0
	        ? this._fulfillmentHandler0
	        : this[index * 5 - 5 + 0];
	};
	
	Promise.prototype._rejectionHandlerAt = function (index) {
	    return index === 0
	        ? this._rejectionHandler0
	        : this[index * 5 - 5 + 1];
	};
	
	Promise.prototype._boundValue = function() {
	    var ret = this._boundTo;
	    if (ret !== undefined) {
	        if (ret instanceof Promise) {
	            if (ret.isFulfilled()) {
	                return ret.value();
	            } else {
	                return undefined;
	            }
	        }
	    }
	    return ret;
	};
	
	Promise.prototype._migrateCallbacks = function (follower, index) {
	    var fulfill = follower._fulfillmentHandlerAt(index);
	    var reject = follower._rejectionHandlerAt(index);
	    var progress = follower._progressHandlerAt(index);
	    var promise = follower._promiseAt(index);
	    var receiver = follower._receiverAt(index);
	    if (promise instanceof Promise) promise._setIsMigrated();
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, progress, promise, receiver, null);
	};
	
	Promise.prototype._addCallbacks = function (
	    fulfill,
	    reject,
	    progress,
	    promise,
	    receiver,
	    domain
	) {
	    var index = this._length();
	
	    if (index >= 131071 - 5) {
	        index = 0;
	        this._setLength(0);
	    }
	
	    if (index === 0) {
	        this._promise0 = promise;
	        if (receiver !== undefined) this._receiver0 = receiver;
	        if (typeof fulfill === "function" && !this._isCarryingStackTrace()) {
	            this._fulfillmentHandler0 =
	                domain === null ? fulfill : domain.bind(fulfill);
	        }
	        if (typeof reject === "function") {
	            this._rejectionHandler0 =
	                domain === null ? reject : domain.bind(reject);
	        }
	        if (typeof progress === "function") {
	            this._progressHandler0 =
	                domain === null ? progress : domain.bind(progress);
	        }
	    } else {
	        var base = index * 5 - 5;
	        this[base + 3] = promise;
	        this[base + 4] = receiver;
	        if (typeof fulfill === "function") {
	            this[base + 0] =
	                domain === null ? fulfill : domain.bind(fulfill);
	        }
	        if (typeof reject === "function") {
	            this[base + 1] =
	                domain === null ? reject : domain.bind(reject);
	        }
	        if (typeof progress === "function") {
	            this[base + 2] =
	                domain === null ? progress : domain.bind(progress);
	        }
	    }
	    this._setLength(index + 1);
	    return index;
	};
	
	Promise.prototype._setProxyHandlers = function (receiver, promiseSlotValue) {
	    var index = this._length();
	
	    if (index >= 131071 - 5) {
	        index = 0;
	        this._setLength(0);
	    }
	    if (index === 0) {
	        this._promise0 = promiseSlotValue;
	        this._receiver0 = receiver;
	    } else {
	        var base = index * 5 - 5;
	        this[base + 3] = promiseSlotValue;
	        this[base + 4] = receiver;
	    }
	    this._setLength(index + 1);
	};
	
	Promise.prototype._proxyPromiseArray = function (promiseArray, index) {
	    this._setProxyHandlers(promiseArray, index);
	};
	
	Promise.prototype._resolveCallback = function(value, shouldBind) {
	    if (this._isFollowingOrFulfilledOrRejected()) return;
	    if (value === this)
	        return this._rejectCallback(makeSelfResolutionError(), false, true);
	    var maybePromise = tryConvertToPromise(value, this);
	    if (!(maybePromise instanceof Promise)) return this._fulfill(value);
	
	    var propagationFlags = 1 | (shouldBind ? 4 : 0);
	    this._propagateFrom(maybePromise, propagationFlags);
	    var promise = maybePromise._target();
	    if (promise._isPending()) {
	        var len = this._length();
	        for (var i = 0; i < len; ++i) {
	            promise._migrateCallbacks(this, i);
	        }
	        this._setFollowing();
	        this._setLength(0);
	        this._setFollowee(promise);
	    } else if (promise._isFulfilled()) {
	        this._fulfillUnchecked(promise._value());
	    } else {
	        this._rejectUnchecked(promise._reason(),
	            promise._getCarriedStackTrace());
	    }
	};
	
	Promise.prototype._rejectCallback =
	function(reason, synchronous, shouldNotMarkOriginatingFromRejection) {
	    if (!shouldNotMarkOriginatingFromRejection) {
	        util.markAsOriginatingFromRejection(reason);
	    }
	    var trace = util.ensureErrorObject(reason);
	    var hasStack = trace === reason;
	    this._attachExtraTrace(trace, synchronous ? hasStack : false);
	    this._reject(reason, hasStack ? undefined : trace);
	};
	
	Promise.prototype._resolveFromResolver = function (resolver) {
	    var promise = this;
	    this._captureStackTrace();
	    this._pushContext();
	    var synchronous = true;
	    var r = tryCatch(resolver)(function(value) {
	        if (promise === null) return;
	        promise._resolveCallback(value);
	        promise = null;
	    }, function (reason) {
	        if (promise === null) return;
	        promise._rejectCallback(reason, synchronous);
	        promise = null;
	    });
	    synchronous = false;
	    this._popContext();
	
	    if (r !== undefined && r === errorObj && promise !== null) {
	        promise._rejectCallback(r.e, true, true);
	        promise = null;
	    }
	};
	
	Promise.prototype._settlePromiseFromHandler = function (
	    handler, receiver, value, promise
	) {
	    if (promise._isRejected()) return;
	    promise._pushContext();
	    var x;
	    if (receiver === APPLY && !this._isRejected()) {
	        x = tryCatch(handler).apply(this._boundValue(), value);
	    } else {
	        x = tryCatch(handler).call(receiver, value);
	    }
	    promise._popContext();
	
	    if (x === errorObj || x === promise || x === NEXT_FILTER) {
	        var err = x === promise ? makeSelfResolutionError() : x.e;
	        promise._rejectCallback(err, false, true);
	    } else {
	        promise._resolveCallback(x);
	    }
	};
	
	Promise.prototype._target = function() {
	    var ret = this;
	    while (ret._isFollowing()) ret = ret._followee();
	    return ret;
	};
	
	Promise.prototype._followee = function() {
	    return this._rejectionHandler0;
	};
	
	Promise.prototype._setFollowee = function(promise) {
	    this._rejectionHandler0 = promise;
	};
	
	Promise.prototype._cleanValues = function () {
	    if (this._cancellable()) {
	        this._cancellationParent = undefined;
	    }
	};
	
	Promise.prototype._propagateFrom = function (parent, flags) {
	    if ((flags & 1) > 0 && parent._cancellable()) {
	        this._setCancellable();
	        this._cancellationParent = parent;
	    }
	    if ((flags & 4) > 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	};
	
	Promise.prototype._fulfill = function (value) {
	    if (this._isFollowingOrFulfilledOrRejected()) return;
	    this._fulfillUnchecked(value);
	};
	
	Promise.prototype._reject = function (reason, carriedStackTrace) {
	    if (this._isFollowingOrFulfilledOrRejected()) return;
	    this._rejectUnchecked(reason, carriedStackTrace);
	};
	
	Promise.prototype._settlePromiseAt = function (index) {
	    var promise = this._promiseAt(index);
	    var isPromise = promise instanceof Promise;
	
	    if (isPromise && promise._isMigrated()) {
	        promise._unsetIsMigrated();
	        return async.invoke(this._settlePromiseAt, this, index);
	    }
	    var handler = this._isFulfilled()
	        ? this._fulfillmentHandlerAt(index)
	        : this._rejectionHandlerAt(index);
	
	    var carriedStackTrace =
	        this._isCarryingStackTrace() ? this._getCarriedStackTrace() : undefined;
	    var value = this._settledValue;
	    var receiver = this._receiverAt(index);
	    this._clearCallbackDataAtIndex(index);
	
	    if (typeof handler === "function") {
	        if (!isPromise) {
	            handler.call(receiver, value, promise);
	        } else {
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (receiver instanceof PromiseArray) {
	        if (!receiver._isResolved()) {
	            if (this._isFulfilled()) {
	                receiver._promiseFulfilled(value, promise);
	            }
	            else {
	                receiver._promiseRejected(value, promise);
	            }
	        }
	    } else if (isPromise) {
	        if (this._isFulfilled()) {
	            promise._fulfill(value);
	        } else {
	            promise._reject(value, carriedStackTrace);
	        }
	    }
	
	    if (index >= 4 && (index & 31) === 4)
	        async.invokeLater(this._setLength, this, 0);
	};
	
	Promise.prototype._clearCallbackDataAtIndex = function(index) {
	    if (index === 0) {
	        if (!this._isCarryingStackTrace()) {
	            this._fulfillmentHandler0 = undefined;
	        }
	        this._rejectionHandler0 =
	        this._progressHandler0 =
	        this._receiver0 =
	        this._promise0 = undefined;
	    } else {
	        var base = index * 5 - 5;
	        this[base + 3] =
	        this[base + 4] =
	        this[base + 0] =
	        this[base + 1] =
	        this[base + 2] = undefined;
	    }
	};
	
	Promise.prototype._isSettlePromisesQueued = function () {
	    return (this._bitField &
	            -1073741824) === -1073741824;
	};
	
	Promise.prototype._setSettlePromisesQueued = function () {
	    this._bitField = this._bitField | -1073741824;
	};
	
	Promise.prototype._unsetSettlePromisesQueued = function () {
	    this._bitField = this._bitField & (~-1073741824);
	};
	
	Promise.prototype._queueSettlePromises = function() {
	    async.settlePromises(this);
	    this._setSettlePromisesQueued();
	};
	
	Promise.prototype._fulfillUnchecked = function (value) {
	    if (value === this) {
	        var err = makeSelfResolutionError();
	        this._attachExtraTrace(err);
	        return this._rejectUnchecked(err, undefined);
	    }
	    this._setFulfilled();
	    this._settledValue = value;
	    this._cleanValues();
	
	    if (this._length() > 0) {
	        this._queueSettlePromises();
	    }
	};
	
	Promise.prototype._rejectUncheckedCheckError = function (reason) {
	    var trace = util.ensureErrorObject(reason);
	    this._rejectUnchecked(reason, trace === reason ? undefined : trace);
	};
	
	Promise.prototype._rejectUnchecked = function (reason, trace) {
	    if (reason === this) {
	        var err = makeSelfResolutionError();
	        this._attachExtraTrace(err);
	        return this._rejectUnchecked(err);
	    }
	    this._setRejected();
	    this._settledValue = reason;
	    this._cleanValues();
	
	    if (this._isFinal()) {
	        async.throwLater(function(e) {
	            if ("stack" in e) {
	                async.invokeFirst(
	                    CapturedTrace.unhandledRejection, undefined, e);
	            }
	            throw e;
	        }, trace === undefined ? reason : trace);
	        return;
	    }
	
	    if (trace !== undefined && trace !== reason) {
	        this._setCarriedStackTrace(trace);
	    }
	
	    if (this._length() > 0) {
	        this._queueSettlePromises();
	    } else {
	        this._ensurePossibleRejectionHandled();
	    }
	};
	
	Promise.prototype._settlePromises = function () {
	    this._unsetSettlePromisesQueued();
	    var len = this._length();
	    for (var i = 0; i < len; i++) {
	        this._settlePromiseAt(i);
	    }
	};
	
	util.notEnumerableProp(Promise,
	                       "_makeSelfResolutionError",
	                       makeSelfResolutionError);
	
	_dereq_("./progress.js")(Promise, PromiseArray);
	_dereq_("./method.js")(Promise, INTERNAL, tryConvertToPromise, apiRejection);
	_dereq_("./bind.js")(Promise, INTERNAL, tryConvertToPromise);
	_dereq_("./finally.js")(Promise, NEXT_FILTER, tryConvertToPromise);
	_dereq_("./direct_resolve.js")(Promise);
	_dereq_("./synchronous_inspection.js")(Promise);
	_dereq_("./join.js")(Promise, PromiseArray, tryConvertToPromise, INTERNAL);
	Promise.Promise = Promise;
	_dereq_('./map.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL);
	_dereq_('./cancel.js')(Promise);
	_dereq_('./using.js')(Promise, apiRejection, tryConvertToPromise, createContext);
	_dereq_('./generators.js')(Promise, apiRejection, INTERNAL, tryConvertToPromise);
	_dereq_('./nodeify.js')(Promise);
	_dereq_('./call_get.js')(Promise);
	_dereq_('./props.js')(Promise, PromiseArray, tryConvertToPromise, apiRejection);
	_dereq_('./race.js')(Promise, INTERNAL, tryConvertToPromise, apiRejection);
	_dereq_('./reduce.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL);
	_dereq_('./settle.js')(Promise, PromiseArray);
	_dereq_('./some.js')(Promise, PromiseArray, apiRejection);
	_dereq_('./promisify.js')(Promise, INTERNAL);
	_dereq_('./any.js')(Promise);
	_dereq_('./each.js')(Promise, INTERNAL);
	_dereq_('./timers.js')(Promise, INTERNAL);
	_dereq_('./filter.js')(Promise, INTERNAL);
	                                                         
	    util.toFastProperties(Promise);                                          
	    util.toFastProperties(Promise.prototype);                                
	    function fillTypes(value) {                                              
	        var p = new Promise(INTERNAL);                                       
	        p._fulfillmentHandler0 = value;                                      
	        p._rejectionHandler0 = value;                                        
	        p._progressHandler0 = value;                                         
	        p._promise0 = value;                                                 
	        p._receiver0 = value;                                                
	        p._settledValue = value;                                             
	    }                                                                        
	    // Complete slack tracking, opt out of field-type tracking and           
	    // stabilize map                                                         
	    fillTypes({a: 1});                                                       
	    fillTypes({b: 2});                                                       
	    fillTypes({c: 3});                                                       
	    fillTypes(1);                                                            
	    fillTypes(function(){});                                                 
	    fillTypes(undefined);                                                    
	    fillTypes(false);                                                        
	    fillTypes(new Promise(INTERNAL));                                        
	    CapturedTrace.setBounds(async.firstLineError, util.lastLineError);       
	    return Promise;                                                          
	
	};
	
	},{"./any.js":1,"./async.js":2,"./bind.js":3,"./call_get.js":5,"./cancel.js":6,"./captured_trace.js":7,"./catch_filter.js":8,"./context.js":9,"./debuggability.js":10,"./direct_resolve.js":11,"./each.js":12,"./errors.js":13,"./filter.js":15,"./finally.js":16,"./generators.js":17,"./join.js":18,"./map.js":19,"./method.js":20,"./nodeify.js":21,"./progress.js":22,"./promise_array.js":24,"./promise_resolver.js":25,"./promisify.js":26,"./props.js":27,"./race.js":29,"./reduce.js":30,"./settle.js":32,"./some.js":33,"./synchronous_inspection.js":34,"./thenables.js":35,"./timers.js":36,"./using.js":37,"./util.js":38}],24:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise,
	    apiRejection) {
	var util = _dereq_("./util.js");
	var isArray = util.isArray;
	
	function toResolutionValue(val) {
	    switch(val) {
	    case -2: return [];
	    case -3: return {};
	    }
	}
	
	function PromiseArray(values) {
	    var promise = this._promise = new Promise(INTERNAL);
	    var parent;
	    if (values instanceof Promise) {
	        parent = values;
	        promise._propagateFrom(parent, 1 | 4);
	    }
	    this._values = values;
	    this._length = 0;
	    this._totalResolved = 0;
	    this._init(undefined, -2);
	}
	PromiseArray.prototype.length = function () {
	    return this._length;
	};
	
	PromiseArray.prototype.promise = function () {
	    return this._promise;
	};
	
	PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
	    var values = tryConvertToPromise(this._values, this._promise);
	    if (values instanceof Promise) {
	        values = values._target();
	        this._values = values;
	        if (values._isFulfilled()) {
	            values = values._value();
	            if (!isArray(values)) {
	                var err = new Promise.TypeError("expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a");
	                this.__hardReject__(err);
	                return;
	            }
	        } else if (values._isPending()) {
	            values._then(
	                init,
	                this._reject,
	                undefined,
	                this,
	                resolveValueIfEmpty
	           );
	            return;
	        } else {
	            this._reject(values._reason());
	            return;
	        }
	    } else if (!isArray(values)) {
	        this._promise._reject(apiRejection("expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a")._reason());
	        return;
	    }
	
	    if (values.length === 0) {
	        if (resolveValueIfEmpty === -5) {
	            this._resolveEmptyArray();
	        }
	        else {
	            this._resolve(toResolutionValue(resolveValueIfEmpty));
	        }
	        return;
	    }
	    var len = this.getActualLength(values.length);
	    this._length = len;
	    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
	    var promise = this._promise;
	    for (var i = 0; i < len; ++i) {
	        var isResolved = this._isResolved();
	        var maybePromise = tryConvertToPromise(values[i], promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            if (isResolved) {
	                maybePromise._ignoreRejections();
	            } else if (maybePromise._isPending()) {
	                maybePromise._proxyPromiseArray(this, i);
	            } else if (maybePromise._isFulfilled()) {
	                this._promiseFulfilled(maybePromise._value(), i);
	            } else {
	                this._promiseRejected(maybePromise._reason(), i);
	            }
	        } else if (!isResolved) {
	            this._promiseFulfilled(maybePromise, i);
	        }
	    }
	};
	
	PromiseArray.prototype._isResolved = function () {
	    return this._values === null;
	};
	
	PromiseArray.prototype._resolve = function (value) {
	    this._values = null;
	    this._promise._fulfill(value);
	};
	
	PromiseArray.prototype.__hardReject__ =
	PromiseArray.prototype._reject = function (reason) {
	    this._values = null;
	    this._promise._rejectCallback(reason, false, true);
	};
	
	PromiseArray.prototype._promiseProgressed = function (progressValue, index) {
	    this._promise._progress({
	        index: index,
	        value: progressValue
	    });
	};
	
	
	PromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	    }
	};
	
	PromiseArray.prototype._promiseRejected = function (reason, index) {
	    this._totalResolved++;
	    this._reject(reason);
	};
	
	PromiseArray.prototype.shouldCopyValues = function () {
	    return true;
	};
	
	PromiseArray.prototype.getActualLength = function (len) {
	    return len;
	};
	
	return PromiseArray;
	};
	
	},{"./util.js":38}],25:[function(_dereq_,module,exports){
	"use strict";
	var util = _dereq_("./util.js");
	var maybeWrapAsError = util.maybeWrapAsError;
	var errors = _dereq_("./errors.js");
	var TimeoutError = errors.TimeoutError;
	var OperationalError = errors.OperationalError;
	var haveGetters = util.haveGetters;
	var es5 = _dereq_("./es5.js");
	
	function isUntypedError(obj) {
	    return obj instanceof Error &&
	        es5.getPrototypeOf(obj) === Error.prototype;
	}
	
	var rErrorKey = /^(?:name|message|stack|cause)$/;
	function wrapAsOperationalError(obj) {
	    var ret;
	    if (isUntypedError(obj)) {
	        ret = new OperationalError(obj);
	        ret.name = obj.name;
	        ret.message = obj.message;
	        ret.stack = obj.stack;
	        var keys = es5.keys(obj);
	        for (var i = 0; i < keys.length; ++i) {
	            var key = keys[i];
	            if (!rErrorKey.test(key)) {
	                ret[key] = obj[key];
	            }
	        }
	        return ret;
	    }
	    util.markAsOriginatingFromRejection(obj);
	    return obj;
	}
	
	function nodebackForPromise(promise) {
	    return function(err, value) {
	        if (promise === null) return;
	
	        if (err) {
	            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
	            promise._attachExtraTrace(wrapped);
	            promise._reject(wrapped);
	        } else if (arguments.length > 2) {
	            var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
	            promise._fulfill(args);
	        } else {
	            promise._fulfill(value);
	        }
	
	        promise = null;
	    };
	}
	
	
	var PromiseResolver;
	if (!haveGetters) {
	    PromiseResolver = function (promise) {
	        this.promise = promise;
	        this.asCallback = nodebackForPromise(promise);
	        this.callback = this.asCallback;
	    };
	}
	else {
	    PromiseResolver = function (promise) {
	        this.promise = promise;
	    };
	}
	if (haveGetters) {
	    var prop = {
	        get: function() {
	            return nodebackForPromise(this.promise);
	        }
	    };
	    es5.defineProperty(PromiseResolver.prototype, "asCallback", prop);
	    es5.defineProperty(PromiseResolver.prototype, "callback", prop);
	}
	
	PromiseResolver._nodebackForPromise = nodebackForPromise;
	
	PromiseResolver.prototype.toString = function () {
	    return "[object PromiseResolver]";
	};
	
	PromiseResolver.prototype.resolve =
	PromiseResolver.prototype.fulfill = function (value) {
	    if (!(this instanceof PromiseResolver)) {
	        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a");
	    }
	    this.promise._resolveCallback(value);
	};
	
	PromiseResolver.prototype.reject = function (reason) {
	    if (!(this instanceof PromiseResolver)) {
	        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a");
	    }
	    this.promise._rejectCallback(reason);
	};
	
	PromiseResolver.prototype.progress = function (value) {
	    if (!(this instanceof PromiseResolver)) {
	        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a");
	    }
	    this.promise._progress(value);
	};
	
	PromiseResolver.prototype.cancel = function (err) {
	    this.promise.cancel(err);
	};
	
	PromiseResolver.prototype.timeout = function () {
	    this.reject(new TimeoutError("timeout"));
	};
	
	PromiseResolver.prototype.isResolved = function () {
	    return this.promise.isResolved();
	};
	
	PromiseResolver.prototype.toJSON = function () {
	    return this.promise.toJSON();
	};
	
	module.exports = PromiseResolver;
	
	},{"./errors.js":13,"./es5.js":14,"./util.js":38}],26:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var THIS = {};
	var util = _dereq_("./util.js");
	var nodebackForPromise = _dereq_("./promise_resolver.js")
	    ._nodebackForPromise;
	var withAppended = util.withAppended;
	var maybeWrapAsError = util.maybeWrapAsError;
	var canEvaluate = util.canEvaluate;
	var TypeError = _dereq_("./errors").TypeError;
	var defaultSuffix = "Async";
	var defaultPromisified = {__isPromisified__: true};
	var noCopyProps = [
	    "arity",    "length",
	    "name",
	    "arguments",
	    "caller",
	    "callee",
	    "prototype",
	    "__isPromisified__"
	];
	var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");
	
	var defaultFilter = function(name) {
	    return util.isIdentifier(name) &&
	        name.charAt(0) !== "_" &&
	        name !== "constructor";
	};
	
	function propsFilter(key) {
	    return !noCopyPropsPattern.test(key);
	}
	
	function isPromisified(fn) {
	    try {
	        return fn.__isPromisified__ === true;
	    }
	    catch (e) {
	        return false;
	    }
	}
	
	function hasPromisified(obj, key, suffix) {
	    var val = util.getDataPropertyOrDefault(obj, key + suffix,
	                                            defaultPromisified);
	    return val ? isPromisified(val) : false;
	}
	function checkValid(ret, suffix, suffixRegexp) {
	    for (var i = 0; i < ret.length; i += 2) {
	        var key = ret[i];
	        if (suffixRegexp.test(key)) {
	            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
	            for (var j = 0; j < ret.length; j += 2) {
	                if (ret[j] === keyWithoutAsyncSuffix) {
	                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/iWrZbw\u000a"
	                        .replace("%s", suffix));
	                }
	            }
	        }
	    }
	}
	
	function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
	    var keys = util.inheritedDataKeys(obj);
	    var ret = [];
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        var value = obj[key];
	        var passesDefaultFilter = filter === defaultFilter
	            ? true : defaultFilter(key, value, obj);
	        if (typeof value === "function" &&
	            !isPromisified(value) &&
	            !hasPromisified(obj, key, suffix) &&
	            filter(key, value, obj, passesDefaultFilter)) {
	            ret.push(key, value);
	        }
	    }
	    checkValid(ret, suffix, suffixRegexp);
	    return ret;
	}
	
	var escapeIdentRegex = function(str) {
	    return str.replace(/([$])/, "\\$");
	};
	
	var makeNodePromisifiedEval;
	if (false) {
	var switchCaseArgumentOrder = function(likelyArgumentCount) {
	    var ret = [likelyArgumentCount];
	    var min = Math.max(0, likelyArgumentCount - 1 - 3);
	    for(var i = likelyArgumentCount - 1; i >= min; --i) {
	        ret.push(i);
	    }
	    for(var i = likelyArgumentCount + 1; i <= 3; ++i) {
	        ret.push(i);
	    }
	    return ret;
	};
	
	var argumentSequence = function(argumentCount) {
	    return util.filledRange(argumentCount, "_arg", "");
	};
	
	var parameterDeclaration = function(parameterCount) {
	    return util.filledRange(
	        Math.max(parameterCount, 3), "_arg", "");
	};
	
	var parameterCount = function(fn) {
	    if (typeof fn.length === "number") {
	        return Math.max(Math.min(fn.length, 1023 + 1), 0);
	    }
	    return 0;
	};
	
	makeNodePromisifiedEval =
	function(callback, receiver, originalName, fn) {
	    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
	    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
	    var shouldProxyThis = typeof callback === "string" || receiver === THIS;
	
	    function generateCallForArgumentCount(count) {
	        var args = argumentSequence(count).join(", ");
	        var comma = count > 0 ? ", " : "";
	        var ret;
	        if (shouldProxyThis) {
	            ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
	        } else {
	            ret = receiver === undefined
	                ? "ret = callback({{args}}, nodeback); break;\n"
	                : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
	        }
	        return ret.replace("{{args}}", args).replace(", ", comma);
	    }
	
	    function generateArgumentSwitchCase() {
	        var ret = "";
	        for (var i = 0; i < argumentOrder.length; ++i) {
	            ret += "case " + argumentOrder[i] +":" +
	                generateCallForArgumentCount(argumentOrder[i]);
	        }
	
	        ret += "                                                             \n\
	        default:                                                             \n\
	            var args = new Array(len + 1);                                   \n\
	            var i = 0;                                                       \n\
	            for (var i = 0; i < len; ++i) {                                  \n\
	               args[i] = arguments[i];                                       \n\
	            }                                                                \n\
	            args[i] = nodeback;                                              \n\
	            [CodeForCall]                                                    \n\
	            break;                                                           \n\
	        ".replace("[CodeForCall]", (shouldProxyThis
	                                ? "ret = callback.apply(this, args);\n"
	                                : "ret = callback.apply(receiver, args);\n"));
	        return ret;
	    }
	
	    var getFunctionCode = typeof callback === "string"
	                                ? ("this != null ? this['"+callback+"'] : fn")
	                                : "fn";
	
	    return new Function("Promise",
	                        "fn",
	                        "receiver",
	                        "withAppended",
	                        "maybeWrapAsError",
	                        "nodebackForPromise",
	                        "tryCatch",
	                        "errorObj",
	                        "notEnumerableProp",
	                        "INTERNAL","'use strict';                            \n\
	        var ret = function (Parameters) {                                    \n\
	            'use strict';                                                    \n\
	            var len = arguments.length;                                      \n\
	            var promise = new Promise(INTERNAL);                             \n\
	            promise._captureStackTrace();                                    \n\
	            var nodeback = nodebackForPromise(promise);                      \n\
	            var ret;                                                         \n\
	            var callback = tryCatch([GetFunctionCode]);                      \n\
	            switch(len) {                                                    \n\
	                [CodeForSwitchCase]                                          \n\
	            }                                                                \n\
	            if (ret === errorObj) {                                          \n\
	                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
	            }                                                                \n\
	            return promise;                                                  \n\
	        };                                                                   \n\
	        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
	        return ret;                                                          \n\
	        "
	        .replace("Parameters", parameterDeclaration(newParameterCount))
	        .replace("[CodeForSwitchCase]", generateArgumentSwitchCase())
	        .replace("[GetFunctionCode]", getFunctionCode))(
	            Promise,
	            fn,
	            receiver,
	            withAppended,
	            maybeWrapAsError,
	            nodebackForPromise,
	            util.tryCatch,
	            util.errorObj,
	            util.notEnumerableProp,
	            INTERNAL
	        );
	};
	}
	
	function makeNodePromisifiedClosure(callback, receiver, _, fn) {
	    var defaultThis = (function() {return this;})();
	    var method = callback;
	    if (typeof method === "string") {
	        callback = fn;
	    }
	    function promisified() {
	        var _receiver = receiver;
	        if (receiver === THIS) _receiver = this;
	        var promise = new Promise(INTERNAL);
	        promise._captureStackTrace();
	        var cb = typeof method === "string" && this !== defaultThis
	            ? this[method] : callback;
	        var fn = nodebackForPromise(promise);
	        try {
	            cb.apply(_receiver, withAppended(arguments, fn));
	        } catch(e) {
	            promise._rejectCallback(maybeWrapAsError(e), true, true);
	        }
	        return promise;
	    }
	    util.notEnumerableProp(promisified, "__isPromisified__", true);
	    return promisified;
	}
	
	var makeNodePromisified = canEvaluate
	    ? makeNodePromisifiedEval
	    : makeNodePromisifiedClosure;
	
	function promisifyAll(obj, suffix, filter, promisifier) {
	    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
	    var methods =
	        promisifiableMethods(obj, suffix, suffixRegexp, filter);
	
	    for (var i = 0, len = methods.length; i < len; i+= 2) {
	        var key = methods[i];
	        var fn = methods[i+1];
	        var promisifiedKey = key + suffix;
	        if (promisifier === makeNodePromisified) {
	            obj[promisifiedKey] =
	                makeNodePromisified(key, THIS, key, fn, suffix);
	        } else {
	            var promisified = promisifier(fn, function() {
	                return makeNodePromisified(key, THIS, key, fn, suffix);
	            });
	            util.notEnumerableProp(promisified, "__isPromisified__", true);
	            obj[promisifiedKey] = promisified;
	        }
	    }
	    util.toFastProperties(obj);
	    return obj;
	}
	
	function promisify(callback, receiver) {
	    return makeNodePromisified(callback, receiver, undefined, callback);
	}
	
	Promise.promisify = function (fn, receiver) {
	    if (typeof fn !== "function") {
	        throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    }
	    if (isPromisified(fn)) {
	        return fn;
	    }
	    var ret = promisify(fn, arguments.length < 2 ? THIS : receiver);
	    util.copyDescriptors(fn, ret, propsFilter);
	    return ret;
	};
	
	Promise.promisifyAll = function (target, options) {
	    if (typeof target !== "function" && typeof target !== "object") {
	        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/9ITlV0\u000a");
	    }
	    options = Object(options);
	    var suffix = options.suffix;
	    if (typeof suffix !== "string") suffix = defaultSuffix;
	    var filter = options.filter;
	    if (typeof filter !== "function") filter = defaultFilter;
	    var promisifier = options.promisifier;
	    if (typeof promisifier !== "function") promisifier = makeNodePromisified;
	
	    if (!util.isIdentifier(suffix)) {
	        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/8FZo5V\u000a");
	    }
	
	    var keys = util.inheritedDataKeys(target);
	    for (var i = 0; i < keys.length; ++i) {
	        var value = target[keys[i]];
	        if (keys[i] !== "constructor" &&
	            util.isClass(value)) {
	            promisifyAll(value.prototype, suffix, filter, promisifier);
	            promisifyAll(value, suffix, filter, promisifier);
	        }
	    }
	
	    return promisifyAll(target, suffix, filter, promisifier);
	};
	};
	
	
	},{"./errors":13,"./promise_resolver.js":25,"./util.js":38}],27:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(
	    Promise, PromiseArray, tryConvertToPromise, apiRejection) {
	var util = _dereq_("./util.js");
	var isObject = util.isObject;
	var es5 = _dereq_("./es5.js");
	
	function PropertiesPromiseArray(obj) {
	    var keys = es5.keys(obj);
	    var len = keys.length;
	    var values = new Array(len * 2);
	    for (var i = 0; i < len; ++i) {
	        var key = keys[i];
	        values[i] = obj[key];
	        values[i + len] = key;
	    }
	    this.constructor$(values);
	}
	util.inherits(PropertiesPromiseArray, PromiseArray);
	
	PropertiesPromiseArray.prototype._init = function () {
	    this._init$(undefined, -3) ;
	};
	
	PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        var val = {};
	        var keyOffset = this.length();
	        for (var i = 0, len = this.length(); i < len; ++i) {
	            val[this._values[i + keyOffset]] = this._values[i];
	        }
	        this._resolve(val);
	    }
	};
	
	PropertiesPromiseArray.prototype._promiseProgressed = function (value, index) {
	    this._promise._progress({
	        key: this._values[index + this.length()],
	        value: value
	    });
	};
	
	PropertiesPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};
	
	PropertiesPromiseArray.prototype.getActualLength = function (len) {
	    return len >> 1;
	};
	
	function props(promises) {
	    var ret;
	    var castValue = tryConvertToPromise(promises);
	
	    if (!isObject(castValue)) {
	        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/OsFKC8\u000a");
	    } else if (castValue instanceof Promise) {
	        ret = castValue._then(
	            Promise.props, undefined, undefined, undefined, undefined);
	    } else {
	        ret = new PropertiesPromiseArray(castValue).promise();
	    }
	
	    if (castValue instanceof Promise) {
	        ret._propagateFrom(castValue, 4);
	    }
	    return ret;
	}
	
	Promise.prototype.props = function () {
	    return props(this);
	};
	
	Promise.props = function (promises) {
	    return props(promises);
	};
	};
	
	},{"./es5.js":14,"./util.js":38}],28:[function(_dereq_,module,exports){
	"use strict";
	function arrayMove(src, srcIndex, dst, dstIndex, len) {
	    for (var j = 0; j < len; ++j) {
	        dst[j + dstIndex] = src[j + srcIndex];
	        src[j + srcIndex] = void 0;
	    }
	}
	
	function Queue(capacity) {
	    this._capacity = capacity;
	    this._length = 0;
	    this._front = 0;
	}
	
	Queue.prototype._willBeOverCapacity = function (size) {
	    return this._capacity < size;
	};
	
	Queue.prototype._pushOne = function (arg) {
	    var length = this.length();
	    this._checkCapacity(length + 1);
	    var i = (this._front + length) & (this._capacity - 1);
	    this[i] = arg;
	    this._length = length + 1;
	};
	
	Queue.prototype._unshiftOne = function(value) {
	    var capacity = this._capacity;
	    this._checkCapacity(this.length() + 1);
	    var front = this._front;
	    var i = (((( front - 1 ) &
	                    ( capacity - 1) ) ^ capacity ) - capacity );
	    this[i] = value;
	    this._front = i;
	    this._length = this.length() + 1;
	};
	
	Queue.prototype.unshift = function(fn, receiver, arg) {
	    this._unshiftOne(arg);
	    this._unshiftOne(receiver);
	    this._unshiftOne(fn);
	};
	
	Queue.prototype.push = function (fn, receiver, arg) {
	    var length = this.length() + 3;
	    if (this._willBeOverCapacity(length)) {
	        this._pushOne(fn);
	        this._pushOne(receiver);
	        this._pushOne(arg);
	        return;
	    }
	    var j = this._front + length - 3;
	    this._checkCapacity(length);
	    var wrapMask = this._capacity - 1;
	    this[(j + 0) & wrapMask] = fn;
	    this[(j + 1) & wrapMask] = receiver;
	    this[(j + 2) & wrapMask] = arg;
	    this._length = length;
	};
	
	Queue.prototype.shift = function () {
	    var front = this._front,
	        ret = this[front];
	
	    this[front] = undefined;
	    this._front = (front + 1) & (this._capacity - 1);
	    this._length--;
	    return ret;
	};
	
	Queue.prototype.length = function () {
	    return this._length;
	};
	
	Queue.prototype._checkCapacity = function (size) {
	    if (this._capacity < size) {
	        this._resizeTo(this._capacity << 1);
	    }
	};
	
	Queue.prototype._resizeTo = function (capacity) {
	    var oldCapacity = this._capacity;
	    this._capacity = capacity;
	    var front = this._front;
	    var length = this._length;
	    var moveItemsCount = (front + length) & (oldCapacity - 1);
	    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
	};
	
	module.exports = Queue;
	
	},{}],29:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(
	    Promise, INTERNAL, tryConvertToPromise, apiRejection) {
	var isArray = _dereq_("./util.js").isArray;
	
	var raceLater = function (promise) {
	    return promise.then(function(array) {
	        return race(array, promise);
	    });
	};
	
	function race(promises, parent) {
	    var maybePromise = tryConvertToPromise(promises);
	
	    if (maybePromise instanceof Promise) {
	        return raceLater(maybePromise);
	    } else if (!isArray(promises)) {
	        return apiRejection("expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a");
	    }
	
	    var ret = new Promise(INTERNAL);
	    if (parent !== undefined) {
	        ret._propagateFrom(parent, 4 | 1);
	    }
	    var fulfill = ret._fulfill;
	    var reject = ret._reject;
	    for (var i = 0, len = promises.length; i < len; ++i) {
	        var val = promises[i];
	
	        if (val === undefined && !(i in promises)) {
	            continue;
	        }
	
	        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
	    }
	    return ret;
	}
	
	Promise.race = function (promises) {
	    return race(promises, undefined);
	};
	
	Promise.prototype.race = function () {
	    return race(this, undefined);
	};
	
	};
	
	},{"./util.js":38}],30:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL) {
	var getDomain = Promise._getDomain;
	var async = _dereq_("./async.js");
	var util = _dereq_("./util.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	function ReductionPromiseArray(promises, fn, accum, _each) {
	    this.constructor$(promises);
	    this._promise._captureStackTrace();
	    this._preservedValues = _each === INTERNAL ? [] : null;
	    this._zerothIsAccum = (accum === undefined);
	    this._gotAccum = false;
	    this._reducingIndex = (this._zerothIsAccum ? 1 : 0);
	    this._valuesPhase = undefined;
	    var maybePromise = tryConvertToPromise(accum, this._promise);
	    var rejected = false;
	    var isPromise = maybePromise instanceof Promise;
	    if (isPromise) {
	        maybePromise = maybePromise._target();
	        if (maybePromise._isPending()) {
	            maybePromise._proxyPromiseArray(this, -1);
	        } else if (maybePromise._isFulfilled()) {
	            accum = maybePromise._value();
	            this._gotAccum = true;
	        } else {
	            this._reject(maybePromise._reason());
	            rejected = true;
	        }
	    }
	    if (!(isPromise || this._zerothIsAccum)) this._gotAccum = true;
	    var domain = getDomain();
	    this._callback = domain === null ? fn : domain.bind(fn);
	    this._accum = accum;
	    if (!rejected) async.invoke(init, this, undefined);
	}
	function init() {
	    this._init$(undefined, -5);
	}
	util.inherits(ReductionPromiseArray, PromiseArray);
	
	ReductionPromiseArray.prototype._init = function () {};
	
	ReductionPromiseArray.prototype._resolveEmptyArray = function () {
	    if (this._gotAccum || this._zerothIsAccum) {
	        this._resolve(this._preservedValues !== null
	                        ? [] : this._accum);
	    }
	};
	
	ReductionPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var values = this._values;
	    values[index] = value;
	    var length = this.length();
	    var preservedValues = this._preservedValues;
	    var isEach = preservedValues !== null;
	    var gotAccum = this._gotAccum;
	    var valuesPhase = this._valuesPhase;
	    var valuesPhaseIndex;
	    if (!valuesPhase) {
	        valuesPhase = this._valuesPhase = new Array(length);
	        for (valuesPhaseIndex=0; valuesPhaseIndex<length; ++valuesPhaseIndex) {
	            valuesPhase[valuesPhaseIndex] = 0;
	        }
	    }
	    valuesPhaseIndex = valuesPhase[index];
	
	    if (index === 0 && this._zerothIsAccum) {
	        this._accum = value;
	        this._gotAccum = gotAccum = true;
	        valuesPhase[index] = ((valuesPhaseIndex === 0)
	            ? 1 : 2);
	    } else if (index === -1) {
	        this._accum = value;
	        this._gotAccum = gotAccum = true;
	    } else {
	        if (valuesPhaseIndex === 0) {
	            valuesPhase[index] = 1;
	        } else {
	            valuesPhase[index] = 2;
	            this._accum = value;
	        }
	    }
	    if (!gotAccum) return;
	
	    var callback = this._callback;
	    var receiver = this._promise._boundValue();
	    var ret;
	
	    for (var i = this._reducingIndex; i < length; ++i) {
	        valuesPhaseIndex = valuesPhase[i];
	        if (valuesPhaseIndex === 2) {
	            this._reducingIndex = i + 1;
	            continue;
	        }
	        if (valuesPhaseIndex !== 1) return;
	        value = values[i];
	        this._promise._pushContext();
	        if (isEach) {
	            preservedValues.push(value);
	            ret = tryCatch(callback).call(receiver, value, i, length);
	        }
	        else {
	            ret = tryCatch(callback)
	                .call(receiver, this._accum, value, i, length);
	        }
	        this._promise._popContext();
	
	        if (ret === errorObj) return this._reject(ret.e);
	
	        var maybePromise = tryConvertToPromise(ret, this._promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            if (maybePromise._isPending()) {
	                valuesPhase[i] = 4;
	                return maybePromise._proxyPromiseArray(this, i);
	            } else if (maybePromise._isFulfilled()) {
	                ret = maybePromise._value();
	            } else {
	                return this._reject(maybePromise._reason());
	            }
	        }
	
	        this._reducingIndex = i + 1;
	        this._accum = ret;
	    }
	
	    this._resolve(isEach ? preservedValues : this._accum);
	};
	
	function reduce(promises, fn, initialValue, _each) {
	    if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
	    return array.promise();
	}
	
	Promise.prototype.reduce = function (fn, initialValue) {
	    return reduce(this, fn, initialValue, null);
	};
	
	Promise.reduce = function (promises, fn, initialValue, _each) {
	    return reduce(promises, fn, initialValue, _each);
	};
	};
	
	},{"./async.js":2,"./util.js":38}],31:[function(_dereq_,module,exports){
	"use strict";
	var schedule;
	var util = _dereq_("./util");
	var noAsyncScheduler = function() {
	    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/m3OTXk\u000a");
	};
	if (util.isNode && typeof MutationObserver === "undefined") {
	    var GlobalSetImmediate = global.setImmediate;
	    var ProcessNextTick = process.nextTick;
	    schedule = util.isRecentNode
	                ? function(fn) { GlobalSetImmediate.call(global, fn); }
	                : function(fn) { ProcessNextTick.call(process, fn); };
	} else if ((typeof MutationObserver !== "undefined") &&
	          !(typeof window !== "undefined" &&
	            window.navigator &&
	            window.navigator.standalone)) {
	    schedule = function(fn) {
	        var div = document.createElement("div");
	        var observer = new MutationObserver(fn);
	        observer.observe(div, {attributes: true});
	        return function() { div.classList.toggle("foo"); };
	    };
	    schedule.isStatic = true;
	} else if (typeof setImmediate !== "undefined") {
	    schedule = function (fn) {
	        setImmediate(fn);
	    };
	} else if (typeof setTimeout !== "undefined") {
	    schedule = function (fn) {
	        setTimeout(fn, 0);
	    };
	} else {
	    schedule = noAsyncScheduler;
	}
	module.exports = schedule;
	
	},{"./util":38}],32:[function(_dereq_,module,exports){
	"use strict";
	module.exports =
	    function(Promise, PromiseArray) {
	var PromiseInspection = Promise.PromiseInspection;
	var util = _dereq_("./util.js");
	
	function SettledPromiseArray(values) {
	    this.constructor$(values);
	}
	util.inherits(SettledPromiseArray, PromiseArray);
	
	SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
	    this._values[index] = inspection;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	    }
	};
	
	SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 268435456;
	    ret._settledValue = value;
	    this._promiseResolved(index, ret);
	};
	SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 134217728;
	    ret._settledValue = reason;
	    this._promiseResolved(index, ret);
	};
	
	Promise.settle = function (promises) {
	    return new SettledPromiseArray(promises).promise();
	};
	
	Promise.prototype.settle = function () {
	    return new SettledPromiseArray(this).promise();
	};
	};
	
	},{"./util.js":38}],33:[function(_dereq_,module,exports){
	"use strict";
	module.exports =
	function(Promise, PromiseArray, apiRejection) {
	var util = _dereq_("./util.js");
	var RangeError = _dereq_("./errors.js").RangeError;
	var AggregateError = _dereq_("./errors.js").AggregateError;
	var isArray = util.isArray;
	
	
	function SomePromiseArray(values) {
	    this.constructor$(values);
	    this._howMany = 0;
	    this._unwrap = false;
	    this._initialized = false;
	}
	util.inherits(SomePromiseArray, PromiseArray);
	
	SomePromiseArray.prototype._init = function () {
	    if (!this._initialized) {
	        return;
	    }
	    if (this._howMany === 0) {
	        this._resolve([]);
	        return;
	    }
	    this._init$(undefined, -5);
	    var isArrayResolved = isArray(this._values);
	    if (!this._isResolved() &&
	        isArrayResolved &&
	        this._howMany > this._canPossiblyFulfill()) {
	        this._reject(this._getRangeError(this.length()));
	    }
	};
	
	SomePromiseArray.prototype.init = function () {
	    this._initialized = true;
	    this._init();
	};
	
	SomePromiseArray.prototype.setUnwrap = function () {
	    this._unwrap = true;
	};
	
	SomePromiseArray.prototype.howMany = function () {
	    return this._howMany;
	};
	
	SomePromiseArray.prototype.setHowMany = function (count) {
	    this._howMany = count;
	};
	
	SomePromiseArray.prototype._promiseFulfilled = function (value) {
	    this._addFulfilled(value);
	    if (this._fulfilled() === this.howMany()) {
	        this._values.length = this.howMany();
	        if (this.howMany() === 1 && this._unwrap) {
	            this._resolve(this._values[0]);
	        } else {
	            this._resolve(this._values);
	        }
	    }
	
	};
	SomePromiseArray.prototype._promiseRejected = function (reason) {
	    this._addRejected(reason);
	    if (this.howMany() > this._canPossiblyFulfill()) {
	        var e = new AggregateError();
	        for (var i = this.length(); i < this._values.length; ++i) {
	            e.push(this._values[i]);
	        }
	        this._reject(e);
	    }
	};
	
	SomePromiseArray.prototype._fulfilled = function () {
	    return this._totalResolved;
	};
	
	SomePromiseArray.prototype._rejected = function () {
	    return this._values.length - this.length();
	};
	
	SomePromiseArray.prototype._addRejected = function (reason) {
	    this._values.push(reason);
	};
	
	SomePromiseArray.prototype._addFulfilled = function (value) {
	    this._values[this._totalResolved++] = value;
	};
	
	SomePromiseArray.prototype._canPossiblyFulfill = function () {
	    return this.length() - this._rejected();
	};
	
	SomePromiseArray.prototype._getRangeError = function (count) {
	    var message = "Input array must contain at least " +
	            this._howMany + " items but contains only " + count + " items";
	    return new RangeError(message);
	};
	
	SomePromiseArray.prototype._resolveEmptyArray = function () {
	    this._reject(this._getRangeError(0));
	};
	
	function some(promises, howMany) {
	    if ((howMany | 0) !== howMany || howMany < 0) {
	        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/1wAmHx\u000a");
	    }
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(howMany);
	    ret.init();
	    return promise;
	}
	
	Promise.some = function (promises, howMany) {
	    return some(promises, howMany);
	};
	
	Promise.prototype.some = function (howMany) {
	    return some(this, howMany);
	};
	
	Promise._SomePromiseArray = SomePromiseArray;
	};
	
	},{"./errors.js":13,"./util.js":38}],34:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise) {
	function PromiseInspection(promise) {
	    if (promise !== undefined) {
	        promise = promise._target();
	        this._bitField = promise._bitField;
	        this._settledValue = promise._settledValue;
	    }
	    else {
	        this._bitField = 0;
	        this._settledValue = undefined;
	    }
	}
	
	PromiseInspection.prototype.value = function () {
	    if (!this.isFulfilled()) {
	        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/hc1DLj\u000a");
	    }
	    return this._settledValue;
	};
	
	PromiseInspection.prototype.error =
	PromiseInspection.prototype.reason = function () {
	    if (!this.isRejected()) {
	        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/hPuiwB\u000a");
	    }
	    return this._settledValue;
	};
	
	PromiseInspection.prototype.isFulfilled =
	Promise.prototype._isFulfilled = function () {
	    return (this._bitField & 268435456) > 0;
	};
	
	PromiseInspection.prototype.isRejected =
	Promise.prototype._isRejected = function () {
	    return (this._bitField & 134217728) > 0;
	};
	
	PromiseInspection.prototype.isPending =
	Promise.prototype._isPending = function () {
	    return (this._bitField & 402653184) === 0;
	};
	
	PromiseInspection.prototype.isResolved =
	Promise.prototype._isResolved = function () {
	    return (this._bitField & 402653184) > 0;
	};
	
	Promise.prototype.isPending = function() {
	    return this._target()._isPending();
	};
	
	Promise.prototype.isRejected = function() {
	    return this._target()._isRejected();
	};
	
	Promise.prototype.isFulfilled = function() {
	    return this._target()._isFulfilled();
	};
	
	Promise.prototype.isResolved = function() {
	    return this._target()._isResolved();
	};
	
	Promise.prototype._value = function() {
	    return this._settledValue;
	};
	
	Promise.prototype._reason = function() {
	    this._unsetRejectionIsUnhandled();
	    return this._settledValue;
	};
	
	Promise.prototype.value = function() {
	    var target = this._target();
	    if (!target.isFulfilled()) {
	        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/hc1DLj\u000a");
	    }
	    return target._settledValue;
	};
	
	Promise.prototype.reason = function() {
	    var target = this._target();
	    if (!target.isRejected()) {
	        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/hPuiwB\u000a");
	    }
	    target._unsetRejectionIsUnhandled();
	    return target._settledValue;
	};
	
	
	Promise.PromiseInspection = PromiseInspection;
	};
	
	},{}],35:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var util = _dereq_("./util.js");
	var errorObj = util.errorObj;
	var isObject = util.isObject;
	
	function tryConvertToPromise(obj, context) {
	    if (isObject(obj)) {
	        if (obj instanceof Promise) {
	            return obj;
	        }
	        else if (isAnyBluebirdPromise(obj)) {
	            var ret = new Promise(INTERNAL);
	            obj._then(
	                ret._fulfillUnchecked,
	                ret._rejectUncheckedCheckError,
	                ret._progressUnchecked,
	                ret,
	                null
	            );
	            return ret;
	        }
	        var then = util.tryCatch(getThen)(obj);
	        if (then === errorObj) {
	            if (context) context._pushContext();
	            var ret = Promise.reject(then.e);
	            if (context) context._popContext();
	            return ret;
	        } else if (typeof then === "function") {
	            return doThenable(obj, then, context);
	        }
	    }
	    return obj;
	}
	
	function getThen(obj) {
	    return obj.then;
	}
	
	var hasProp = {}.hasOwnProperty;
	function isAnyBluebirdPromise(obj) {
	    return hasProp.call(obj, "_promise0");
	}
	
	function doThenable(x, then, context) {
	    var promise = new Promise(INTERNAL);
	    var ret = promise;
	    if (context) context._pushContext();
	    promise._captureStackTrace();
	    if (context) context._popContext();
	    var synchronous = true;
	    var result = util.tryCatch(then).call(x,
	                                        resolveFromThenable,
	                                        rejectFromThenable,
	                                        progressFromThenable);
	    synchronous = false;
	    if (promise && result === errorObj) {
	        promise._rejectCallback(result.e, true, true);
	        promise = null;
	    }
	
	    function resolveFromThenable(value) {
	        if (!promise) return;
	        promise._resolveCallback(value);
	        promise = null;
	    }
	
	    function rejectFromThenable(reason) {
	        if (!promise) return;
	        promise._rejectCallback(reason, synchronous, true);
	        promise = null;
	    }
	
	    function progressFromThenable(value) {
	        if (!promise) return;
	        if (typeof promise._progress === "function") {
	            promise._progress(value);
	        }
	    }
	    return ret;
	}
	
	return tryConvertToPromise;
	};
	
	},{"./util.js":38}],36:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var util = _dereq_("./util.js");
	var TimeoutError = Promise.TimeoutError;
	
	var afterTimeout = function (promise, message) {
	    if (!promise.isPending()) return;
	    
	    var err;
	    if(!util.isPrimitive(message) && (message instanceof Error)) {
	        err = message;
	    } else {
	        if (typeof message !== "string") {
	            message = "operation timed out";
	        }
	        err = new TimeoutError(message);
	    }
	    util.markAsOriginatingFromRejection(err);
	    promise._attachExtraTrace(err);
	    promise._cancel(err);
	};
	
	var afterValue = function(value) { return delay(+this).thenReturn(value); };
	var delay = Promise.delay = function (value, ms) {
	    if (ms === undefined) {
	        ms = value;
	        value = undefined;
	        var ret = new Promise(INTERNAL);
	        setTimeout(function() { ret._fulfill(); }, ms);
	        return ret;
	    }
	    ms = +ms;
	    return Promise.resolve(value)._then(afterValue, null, null, ms, undefined);
	};
	
	Promise.prototype.delay = function (ms) {
	    return delay(this, ms);
	};
	
	function successClear(value) {
	    var handle = this;
	    if (handle instanceof Number) handle = +handle;
	    clearTimeout(handle);
	    return value;
	}
	
	function failureClear(reason) {
	    var handle = this;
	    if (handle instanceof Number) handle = +handle;
	    clearTimeout(handle);
	    throw reason;
	}
	
	Promise.prototype.timeout = function (ms, message) {
	    ms = +ms;
	    var ret = this.then().cancellable();
	    ret._cancellationParent = this;
	    var handle = setTimeout(function timeoutTimeout() {
	        afterTimeout(ret, message);
	    }, ms);
	    return ret._then(successClear, failureClear, undefined, handle, undefined);
	};
	
	};
	
	},{"./util.js":38}],37:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function (Promise, apiRejection, tryConvertToPromise,
	    createContext) {
	    var TypeError = _dereq_("./errors.js").TypeError;
	    var inherits = _dereq_("./util.js").inherits;
	    var PromiseInspection = Promise.PromiseInspection;
	
	    function inspectionMapper(inspections) {
	        var len = inspections.length;
	        for (var i = 0; i < len; ++i) {
	            var inspection = inspections[i];
	            if (inspection.isRejected()) {
	                return Promise.reject(inspection.error());
	            }
	            inspections[i] = inspection._settledValue;
	        }
	        return inspections;
	    }
	
	    function thrower(e) {
	        setTimeout(function(){throw e;}, 0);
	    }
	
	    function castPreservingDisposable(thenable) {
	        var maybePromise = tryConvertToPromise(thenable);
	        if (maybePromise !== thenable &&
	            typeof thenable._isDisposable === "function" &&
	            typeof thenable._getDisposer === "function" &&
	            thenable._isDisposable()) {
	            maybePromise._setDisposable(thenable._getDisposer());
	        }
	        return maybePromise;
	    }
	    function dispose(resources, inspection) {
	        var i = 0;
	        var len = resources.length;
	        var ret = Promise.defer();
	        function iterator() {
	            if (i >= len) return ret.resolve();
	            var maybePromise = castPreservingDisposable(resources[i++]);
	            if (maybePromise instanceof Promise &&
	                maybePromise._isDisposable()) {
	                try {
	                    maybePromise = tryConvertToPromise(
	                        maybePromise._getDisposer().tryDispose(inspection),
	                        resources.promise);
	                } catch (e) {
	                    return thrower(e);
	                }
	                if (maybePromise instanceof Promise) {
	                    return maybePromise._then(iterator, thrower,
	                                              null, null, null);
	                }
	            }
	            iterator();
	        }
	        iterator();
	        return ret.promise;
	    }
	
	    function disposerSuccess(value) {
	        var inspection = new PromiseInspection();
	        inspection._settledValue = value;
	        inspection._bitField = 268435456;
	        return dispose(this, inspection).thenReturn(value);
	    }
	
	    function disposerFail(reason) {
	        var inspection = new PromiseInspection();
	        inspection._settledValue = reason;
	        inspection._bitField = 134217728;
	        return dispose(this, inspection).thenThrow(reason);
	    }
	
	    function Disposer(data, promise, context) {
	        this._data = data;
	        this._promise = promise;
	        this._context = context;
	    }
	
	    Disposer.prototype.data = function () {
	        return this._data;
	    };
	
	    Disposer.prototype.promise = function () {
	        return this._promise;
	    };
	
	    Disposer.prototype.resource = function () {
	        if (this.promise().isFulfilled()) {
	            return this.promise().value();
	        }
	        return null;
	    };
	
	    Disposer.prototype.tryDispose = function(inspection) {
	        var resource = this.resource();
	        var context = this._context;
	        if (context !== undefined) context._pushContext();
	        var ret = resource !== null
	            ? this.doDispose(resource, inspection) : null;
	        if (context !== undefined) context._popContext();
	        this._promise._unsetDisposable();
	        this._data = null;
	        return ret;
	    };
	
	    Disposer.isDisposer = function (d) {
	        return (d != null &&
	                typeof d.resource === "function" &&
	                typeof d.tryDispose === "function");
	    };
	
	    function FunctionDisposer(fn, promise, context) {
	        this.constructor$(fn, promise, context);
	    }
	    inherits(FunctionDisposer, Disposer);
	
	    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
	        var fn = this.data();
	        return fn.call(resource, resource, inspection);
	    };
	
	    function maybeUnwrapDisposer(value) {
	        if (Disposer.isDisposer(value)) {
	            this.resources[this.index]._setDisposable(value);
	            return value.promise();
	        }
	        return value;
	    }
	
	    Promise.using = function () {
	        var len = arguments.length;
	        if (len < 2) return apiRejection(
	                        "you must pass at least 2 arguments to Promise.using");
	        var fn = arguments[len - 1];
	        if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	
	        var input;
	        var spreadArgs = true;
	        if (len === 2 && Array.isArray(arguments[0])) {
	            input = arguments[0];
	            len = input.length;
	            spreadArgs = false;
	        } else {
	            input = arguments;
	            len--;
	        }
	        var resources = new Array(len);
	        for (var i = 0; i < len; ++i) {
	            var resource = input[i];
	            if (Disposer.isDisposer(resource)) {
	                var disposer = resource;
	                resource = resource.promise();
	                resource._setDisposable(disposer);
	            } else {
	                var maybePromise = tryConvertToPromise(resource);
	                if (maybePromise instanceof Promise) {
	                    resource =
	                        maybePromise._then(maybeUnwrapDisposer, null, null, {
	                            resources: resources,
	                            index: i
	                    }, undefined);
	                }
	            }
	            resources[i] = resource;
	        }
	
	        var promise = Promise.settle(resources)
	            .then(inspectionMapper)
	            .then(function(vals) {
	                promise._pushContext();
	                var ret;
	                try {
	                    ret = spreadArgs
	                        ? fn.apply(undefined, vals) : fn.call(undefined,  vals);
	                } finally {
	                    promise._popContext();
	                }
	                return ret;
	            })
	            ._then(
	                disposerSuccess, disposerFail, undefined, resources, undefined);
	        resources.promise = promise;
	        return promise;
	    };
	
	    Promise.prototype._setDisposable = function (disposer) {
	        this._bitField = this._bitField | 262144;
	        this._disposer = disposer;
	    };
	
	    Promise.prototype._isDisposable = function () {
	        return (this._bitField & 262144) > 0;
	    };
	
	    Promise.prototype._getDisposer = function () {
	        return this._disposer;
	    };
	
	    Promise.prototype._unsetDisposable = function () {
	        this._bitField = this._bitField & (~262144);
	        this._disposer = undefined;
	    };
	
	    Promise.prototype.disposer = function (fn) {
	        if (typeof fn === "function") {
	            return new FunctionDisposer(fn, this, createContext());
	        }
	        throw new TypeError();
	    };
	
	};
	
	},{"./errors.js":13,"./util.js":38}],38:[function(_dereq_,module,exports){
	"use strict";
	var es5 = _dereq_("./es5.js");
	var canEvaluate = typeof navigator == "undefined";
	var haveGetters = (function(){
	    try {
	        var o = {};
	        es5.defineProperty(o, "f", {
	            get: function () {
	                return 3;
	            }
	        });
	        return o.f === 3;
	    }
	    catch (e) {
	        return false;
	    }
	
	})();
	
	var errorObj = {e: {}};
	var tryCatchTarget;
	function tryCatcher() {
	    try {
	        var target = tryCatchTarget;
	        tryCatchTarget = null;
	        return target.apply(this, arguments);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}
	function tryCatch(fn) {
	    tryCatchTarget = fn;
	    return tryCatcher;
	}
	
	var inherits = function(Child, Parent) {
	    var hasProp = {}.hasOwnProperty;
	
	    function T() {
	        this.constructor = Child;
	        this.constructor$ = Parent;
	        for (var propertyName in Parent.prototype) {
	            if (hasProp.call(Parent.prototype, propertyName) &&
	                propertyName.charAt(propertyName.length-1) !== "$"
	           ) {
	                this[propertyName + "$"] = Parent.prototype[propertyName];
	            }
	        }
	    }
	    T.prototype = Parent.prototype;
	    Child.prototype = new T();
	    return Child.prototype;
	};
	
	
	function isPrimitive(val) {
	    return val == null || val === true || val === false ||
	        typeof val === "string" || typeof val === "number";
	
	}
	
	function isObject(value) {
	    return !isPrimitive(value);
	}
	
	function maybeWrapAsError(maybeError) {
	    if (!isPrimitive(maybeError)) return maybeError;
	
	    return new Error(safeToString(maybeError));
	}
	
	function withAppended(target, appendee) {
	    var len = target.length;
	    var ret = new Array(len + 1);
	    var i;
	    for (i = 0; i < len; ++i) {
	        ret[i] = target[i];
	    }
	    ret[i] = appendee;
	    return ret;
	}
	
	function getDataPropertyOrDefault(obj, key, defaultValue) {
	    if (es5.isES5) {
	        var desc = Object.getOwnPropertyDescriptor(obj, key);
	
	        if (desc != null) {
	            return desc.get == null && desc.set == null
	                    ? desc.value
	                    : defaultValue;
	        }
	    } else {
	        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
	    }
	}
	
	function notEnumerableProp(obj, name, value) {
	    if (isPrimitive(obj)) return obj;
	    var descriptor = {
	        value: value,
	        configurable: true,
	        enumerable: false,
	        writable: true
	    };
	    es5.defineProperty(obj, name, descriptor);
	    return obj;
	}
	
	function thrower(r) {
	    throw r;
	}
	
	var inheritedDataKeys = (function() {
	    var excludedPrototypes = [
	        Array.prototype,
	        Object.prototype,
	        Function.prototype
	    ];
	
	    var isExcludedProto = function(val) {
	        for (var i = 0; i < excludedPrototypes.length; ++i) {
	            if (excludedPrototypes[i] === val) {
	                return true;
	            }
	        }
	        return false;
	    };
	
	    if (es5.isES5) {
	        var getKeys = Object.getOwnPropertyNames;
	        return function(obj) {
	            var ret = [];
	            var visitedKeys = Object.create(null);
	            while (obj != null && !isExcludedProto(obj)) {
	                var keys;
	                try {
	                    keys = getKeys(obj);
	                } catch (e) {
	                    return ret;
	                }
	                for (var i = 0; i < keys.length; ++i) {
	                    var key = keys[i];
	                    if (visitedKeys[key]) continue;
	                    visitedKeys[key] = true;
	                    var desc = Object.getOwnPropertyDescriptor(obj, key);
	                    if (desc != null && desc.get == null && desc.set == null) {
	                        ret.push(key);
	                    }
	                }
	                obj = es5.getPrototypeOf(obj);
	            }
	            return ret;
	        };
	    } else {
	        var hasProp = {}.hasOwnProperty;
	        return function(obj) {
	            if (isExcludedProto(obj)) return [];
	            var ret = [];
	
	            /*jshint forin:false */
	            enumeration: for (var key in obj) {
	                if (hasProp.call(obj, key)) {
	                    ret.push(key);
	                } else {
	                    for (var i = 0; i < excludedPrototypes.length; ++i) {
	                        if (hasProp.call(excludedPrototypes[i], key)) {
	                            continue enumeration;
	                        }
	                    }
	                    ret.push(key);
	                }
	            }
	            return ret;
	        };
	    }
	
	})();
	
	var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
	function isClass(fn) {
	    try {
	        if (typeof fn === "function") {
	            var keys = es5.names(fn.prototype);
	
	            var hasMethods = es5.isES5 && keys.length > 1;
	            var hasMethodsOtherThanConstructor = keys.length > 0 &&
	                !(keys.length === 1 && keys[0] === "constructor");
	            var hasThisAssignmentAndStaticMethods =
	                thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;
	
	            if (hasMethods || hasMethodsOtherThanConstructor ||
	                hasThisAssignmentAndStaticMethods) {
	                return true;
	            }
	        }
	        return false;
	    } catch (e) {
	        return false;
	    }
	}
	
	function toFastProperties(obj) {
	    /*jshint -W027,-W055,-W031*/
	    function f() {}
	    f.prototype = obj;
	    var l = 8;
	    while (l--) new f();
	    return obj;
	    eval(obj);
	}
	
	var rident = /^[a-z$_][a-z$_0-9]*$/i;
	function isIdentifier(str) {
	    return rident.test(str);
	}
	
	function filledRange(count, prefix, suffix) {
	    var ret = new Array(count);
	    for(var i = 0; i < count; ++i) {
	        ret[i] = prefix + i + suffix;
	    }
	    return ret;
	}
	
	function safeToString(obj) {
	    try {
	        return obj + "";
	    } catch (e) {
	        return "[no string representation]";
	    }
	}
	
	function markAsOriginatingFromRejection(e) {
	    try {
	        notEnumerableProp(e, "isOperational", true);
	    }
	    catch(ignore) {}
	}
	
	function originatesFromRejection(e) {
	    if (e == null) return false;
	    return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
	        e["isOperational"] === true);
	}
	
	function canAttachTrace(obj) {
	    return obj instanceof Error && es5.propertyIsWritable(obj, "stack");
	}
	
	var ensureErrorObject = (function() {
	    if (!("stack" in new Error())) {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            try {throw new Error(safeToString(value));}
	            catch(err) {return err;}
	        };
	    } else {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            return new Error(safeToString(value));
	        };
	    }
	})();
	
	function classString(obj) {
	    return {}.toString.call(obj);
	}
	
	function copyDescriptors(from, to, filter) {
	    var keys = es5.names(from);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        if (filter(key)) {
	            try {
	                es5.defineProperty(to, key, es5.getDescriptor(from, key));
	            } catch (ignore) {}
	        }
	    }
	}
	
	var ret = {
	    isClass: isClass,
	    isIdentifier: isIdentifier,
	    inheritedDataKeys: inheritedDataKeys,
	    getDataPropertyOrDefault: getDataPropertyOrDefault,
	    thrower: thrower,
	    isArray: es5.isArray,
	    haveGetters: haveGetters,
	    notEnumerableProp: notEnumerableProp,
	    isPrimitive: isPrimitive,
	    isObject: isObject,
	    canEvaluate: canEvaluate,
	    errorObj: errorObj,
	    tryCatch: tryCatch,
	    inherits: inherits,
	    withAppended: withAppended,
	    maybeWrapAsError: maybeWrapAsError,
	    toFastProperties: toFastProperties,
	    filledRange: filledRange,
	    toString: safeToString,
	    canAttachTrace: canAttachTrace,
	    ensureErrorObject: ensureErrorObject,
	    originatesFromRejection: originatesFromRejection,
	    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
	    classString: classString,
	    copyDescriptors: copyDescriptors,
	    hasDevTools: typeof chrome !== "undefined" && chrome &&
	                 typeof chrome.loadTimes === "function",
	    isNode: typeof process !== "undefined" &&
	        classString(process).toLowerCase() === "[object process]"
	};
	ret.isRecentNode = ret.isNode && (function() {
	    var version = process.versions.node.split(".").map(Number);
	    return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
	})();
	
	if (ret.isNode) ret.toFastProperties(process);
	
	try {throw new Error(); } catch (e) {ret.lastLineError = e;}
	module.exports = ret;
	
	},{"./es5.js":14}]},{},[4])(4)
	});                    ;if (typeof window !== 'undefined' && window !== null) {                               window.P = window.Promise;                                                     } else if (typeof self !== 'undefined' && self !== null) {                             self.P = self.Promise;                                                         }
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! (webpack)/~/node-libs-browser/~/process/browser.js */ 11), (function() { return this; }()), __webpack_require__(/*! (webpack)/~/node-libs-browser/~/timers-browserify/main.js */ 12).setImmediate))

/***/ },
/* 11 */
/*!**********************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/process/browser.js ***!
  \**********************************************************/
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 12 */
/*!*****************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/timers-browserify/main.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(/*! process/browser.js */ 11).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);
	
	  immediateIds[id] = true;
	
	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });
	
	  return id;
	};
	
	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! (webpack)/~/node-libs-browser/~/timers-browserify/main.js */ 12).setImmediate, __webpack_require__(/*! (webpack)/~/node-libs-browser/~/timers-browserify/main.js */ 12).clearImmediate))

/***/ },
/* 13 */
/*!********************************************************!*\
  !*** ./~/signalk-client/~/superagent-promise/index.js ***!
  \********************************************************/
/***/ function(module, exports) {

	/**
	 * Promise wrapper for superagent
	 */
	
	function wrap(superagent, Promise) {
	  /**
	   * Request object similar to superagent.Request, but with end() returning
	   * a promise.
	   */
	  function PromiseRequest() {
	    superagent.Request.apply(this, arguments);
	  }
	
	  // Inherit form superagent.Request
	  PromiseRequest.prototype = Object.create(superagent.Request.prototype);
	
	  /** Send request and get a promise that `end` was emitted */
	  PromiseRequest.prototype.end = function(cb) {
	    var _end = superagent.Request.prototype.end;
	    var self = this;
	
	    return new Promise(function(accept, reject) {
	      _end.call(self, function(err, response) {
	        if (cb) {
	          cb(err, response);
	        }
	
	        if (err) {
	          err.response = response;
	          reject(err);
	        } else {
	          accept(response);
	        }
	      });
	    });
	  };
	
	  /** Provide a more promise-y interface */
	  PromiseRequest.prototype.then = function(resolve, reject) {
	    var _end = superagent.Request.prototype.end;
	    var self = this;
	
	    return new Promise(function(accept, reject) {
	      _end.call(self, function(err, response) {
	        if (err) {
	          err.response = response;
	          reject(err);
	        } else {
	          accept(response);
	        }
	      });
	    }).then(resolve, reject);
	  };
	
	  /**
	   * Request builder with same interface as superagent.
	   * It is convenient to import this as `request` in place of superagent.
	   */
	  var request = function(method, url) {
	    return new PromiseRequest(method, url);
	  };
	
	  /** Helper for making an options request */
	  request.options = function(url) {
	    return request('OPTIONS', url);
	  }
	
	  /** Helper for making a head request */
	  request.head = function(url, data) {
	    var req = request('HEAD', url);
	    if (data) {
	      req.send(data);
	    }
	    return req;
	  };
	
	  /** Helper for making a get request */
	  request.get = function(url, data) {
	    var req = request('GET', url);
	    if (data) {
	      req.query(data);
	    }
	    return req;
	  };
	
	  /** Helper for making a post request */
	  request.post = function(url, data) {
	    var req = request('POST', url);
	    if (data) {
	      req.send(data);
	    }
	    return req;
	  };
	
	  /** Helper for making a put request */
	  request.put = function(url, data) {
	    var req = request('PUT', url);
	    if (data) {
	      req.send(data);
	    }
	    return req;
	  };
	
	  /** Helper for making a patch request */
	  request.patch = function(url, data) {
	    var req = request('PATCH', url);
	    if (data) {
	      req.send(data);
	    }
	    return req;
	  };
	
	  /** Helper for making a delete request */
	  request.del = function(url) {
	    return request('DELETE', url);
	  };
	
	  // Export the request builder
	  return request;
	}
	
	module.exports = wrap;


/***/ },
/* 14 */
/*!*****************************************************!*\
  !*** ./~/signalk-client/~/superagent/lib/client.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var Emitter = __webpack_require__(/*! emitter */ 15);
	var reduce = __webpack_require__(/*! reduce */ 16);
	
	/**
	 * Root reference for iframes.
	 */
	
	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  root = this;
	}
	
	/**
	 * Noop.
	 */
	
	function noop(){};
	
	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * TODO: future proof, move to compoent land
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	function isHost(obj) {
	  var str = {}.toString.call(obj);
	
	  switch (str) {
	    case '[object File]':
	    case '[object Blob]':
	    case '[object FormData]':
	      return true;
	    default:
	      return false;
	  }
	}
	
	/**
	 * Determine XHR.
	 */
	
	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  return false;
	};
	
	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */
	
	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };
	
	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	function isObject(obj) {
	  return obj === Object(obj);
	}
	
	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */
	
	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    if (null != obj[key]) {
	      pushEncodedKeyValuePair(pairs, key, obj[key]);
	        }
	      }
	  return pairs.join('&');
	}
	
	/**
	 * Helps 'serialize' with serializing arrays.
	 * Mutates the pairs array.
	 *
	 * @param {Array} pairs
	 * @param {String} key
	 * @param {Mixed} val
	 */
	
	function pushEncodedKeyValuePair(pairs, key, val) {
	  if (Array.isArray(val)) {
	    return val.forEach(function(v) {
	      pushEncodedKeyValuePair(pairs, key, v);
	    });
	  }
	  pairs.push(encodeURIComponent(key)
	    + '=' + encodeURIComponent(val));
	}
	
	/**
	 * Expose serialization method.
	 */
	
	 request.serializeObject = serialize;
	
	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */
	
	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var parts;
	  var pair;
	
	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    parts = pair.split('=');
	    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	  }
	
	  return obj;
	}
	
	/**
	 * Expose parser.
	 */
	
	request.parseString = parseString;
	
	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */
	
	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};
	
	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */
	
	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };
	
	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */
	
	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};
	
	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;
	
	  lines.pop(); // trailing CRLF
	
	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }
	
	  return fields;
	}
	
	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */
	
	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}
	
	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */
	
	function type(str){
	  return str.split(/ *; */).shift();
	};
	
	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	function params(str){
	  return reduce(str.split(/ *; */), function(obj, str){
	    var parts = str.split(/ *= */)
	      , key = parts.shift()
	      , val = parts.shift();
	
	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};
	
	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */
	
	function Response(req, options) {
	  options = options || {};
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  this.setStatusProperties(this.xhr.status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this.setHeaderProperties(this.header);
	  this.body = this.req.method != 'HEAD'
	    ? this.parseBody(this.text ? this.text : this.xhr.response)
	    : null;
	}
	
	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */
	
	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};
	
	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */
	
	Response.prototype.setHeaderProperties = function(header){
	  // content-type
	  var ct = this.header['content-type'] || '';
	  this.type = type(ct);
	
	  // params
	  var obj = params(ct);
	  for (var key in obj) this[key] = obj[key];
	};
	
	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */
	
	Response.prototype.parseBody = function(str){
	  var parse = request.parse[this.type];
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};
	
	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */
	
	Response.prototype.setStatusProperties = function(status){
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	    status = 204;
	  }
	
	  var type = status / 100 | 0;
	
	  // status / class
	  this.status = this.statusCode = status;
	  this.statusType = type;
	
	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;
	
	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.notFound = 404 == status;
	  this.forbidden = 403 == status;
	};
	
	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */
	
	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;
	
	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;
	
	  return err;
	};
	
	/**
	 * Expose `Response`.
	 */
	
	request.Response = Response;
	
	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */
	
	function Request(method, url) {
	  var self = this;
	  Emitter.call(this);
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {};
	  this._header = {};
	  this.on('end', function(){
	    var err = null;
	    var res = null;
	
	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      // issue #675: return the raw response if the response parsing fails
	      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
	      return self.callback(err);
	    }
	
	    self.emit('response', res);
	
	    if (err) {
	      return self.callback(err, res);
	    }
	
	    if (res.status >= 200 && res.status < 300) {
	      return self.callback(err, res);
	    }
	
	    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	    new_err.original = err;
	    new_err.response = res;
	    new_err.status = res.status;
	
	    self.callback(new_err, res);
	  });
	}
	
	/**
	 * Mixin `Emitter`.
	 */
	
	Emitter(Request.prototype);
	
	/**
	 * Allow for extension
	 */
	
	Request.prototype.use = function(fn) {
	  fn(this);
	  return this;
	}
	
	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.timeout = function(ms){
	  this._timeout = ms;
	  return this;
	};
	
	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.clearTimeout = function(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};
	
	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */
	
	Request.prototype.abort = function(){
	  if (this.aborted) return;
	  this.aborted = true;
	  this.xhr.abort();
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};
	
	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};
	
	/**
	 * Remove header `field`.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};
	
	/**
	 * Get case-insensitive header `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 */
	
	Request.prototype.getHeader = function(field){
	  return this._header[field.toLowerCase()];
	};
	
	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Force given parser
	 *
	 * Sets the body parser no matter type.
	 *
	 * @param {Function}
	 * @api public
	 */
	
	Request.prototype.parse = function(fn){
	  this._parser = fn;
	  return this;
	};
	
	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.auth = function(user, pass){
	  var str = btoa(user + ':' + pass);
	  this.set('Authorization', 'Basic ' + str);
	  return this;
	};
	
	/**
	* Add query-string `val`.
	*
	* Examples:
	*
	*   request.get('/shoes')
	*     .query('size=10')
	*     .query({ color: 'blue' })
	*
	* @param {Object|String} val
	* @return {Request} for chaining
	* @api public
	*/
	
	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};
	
	/**
	 * Write the field `name` and `val` for "multipart/form-data"
	 * request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} name
	 * @param {String|Blob|File} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.field = function(name, val){
	  if (!this._formData) this._formData = new root.FormData();
	  this._formData.append(name, val);
	  return this;
	};
	
	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.attach = function(field, file, filename){
	  if (!this._formData) this._formData = new root.FormData();
	  this._formData.append(field, file, filename);
	  return this;
	};
	
	/**
	 * Send `data`, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // querystring
	 *       request.get('/search')
	 *         .end(callback)
	 *
	 *       // multiple data "writes"
	 *       request.get('/search')
	 *         .send({ search: 'query' })
	 *         .send({ range: '1..5' })
	 *         .send({ order: 'desc' })
	 *         .end(callback)
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	  *      request.post('/user')
	  *        .send('name=tobi')
	  *        .send('species=ferret')
	  *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.send = function(data){
	  var obj = isObject(data);
	  var type = this.getHeader('Content-Type');
	
	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    if (!type) this.type('form');
	    type = this.getHeader('Content-Type');
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }
	
	  if (!obj || isHost(data)) return this;
	  if (!type) this.type('json');
	  return this;
	};
	
	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */
	
	Request.prototype.callback = function(err, res){
	  var fn = this._callback;
	  this.clearTimeout();
	  fn(err, res);
	};
	
	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */
	
	Request.prototype.crossDomainError = function(){
	  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
	  err.crossDomain = true;
	
	  err.status = this.status;
	  err.method = this.method;
	  err.url = this.url;
	
	  this.callback(err);
	};
	
	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */
	
	Request.prototype.timeoutError = function(){
	  var timeout = this._timeout;
	  var err = new Error('timeout of ' + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  this.callback(err);
	};
	
	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */
	
	Request.prototype.withCredentials = function(){
	  this._withCredentials = true;
	  return this;
	};
	
	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.end = function(fn){
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var query = this._query.join('&');
	  var timeout = this._timeout;
	  var data = this._formData || this._data;
	
	  // store callback
	  this._callback = fn || noop;
	
	  // state change
	  xhr.onreadystatechange = function(){
	    if (4 != xhr.readyState) return;
	
	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }
	
	    if (0 == status) {
	      if (self.timedout) return self.timeoutError();
	      if (self.aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };
	
	  // progress
	  var handleProgress = function(e){
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    self.emit('progress', e);
	  };
	  if (this.hasListeners('progress')) {
	    xhr.onprogress = handleProgress;
	  }
	  try {
	    if (xhr.upload && this.hasListeners('progress')) {
	      xhr.upload.onprogress = handleProgress;
	    }
	  } catch(e) {
	    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	    // Reported here:
	    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	  }
	
	  // timeout
	  if (timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self.timedout = true;
	      self.abort();
	    }, timeout);
	  }
	
	  // querystring
	  if (query) {
	    query = request.serializeObject(query);
	    this.url += ~this.url.indexOf('?')
	      ? '&' + query
	      : '?' + query;
	  }
	
	  // initiate request
	  xhr.open(this.method, this.url, true);
	
	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;
	
	  // body
	  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
	    // serialize stuff
	    var contentType = this.getHeader('Content-Type');
	    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
	    if (serialize) data = serialize(data);
	  }
	
	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }
	
	  // send stuff
	  this.emit('request', this);
	
	  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
	  // We need null here if data is undefined
	  xhr.send(typeof data !== 'undefined' ? data : null);
	  return this;
	};
	
	/**
	 * Faux promise support
	 *
	 * @param {Function} fulfill
	 * @param {Function} reject
	 * @return {Request}
	 */
	
	Request.prototype.then = function (fulfill, reject) {
	  return this.end(function(err, res) {
	    err ? reject(err) : fulfill(res);
	  });
	}
	
	/**
	 * Expose `Request`.
	 */
	
	request.Request = Request;
	
	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */
	
	function request(method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new Request('GET', method).end(url);
	  }
	
	  // url first
	  if (1 == arguments.length) {
	    return new Request('GET', method);
	  }
	
	  return new Request(method, url);
	}
	
	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * DELETE `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	function del(url, fn){
	  var req = request('DELETE', url);
	  if (fn) req.end(fn);
	  return req;
	};
	
	request.del = del;
	request.delete = del;
	
	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * Expose `request`.
	 */
	
	module.exports = request;


/***/ },
/* 15 */
/*!********************************************************************!*\
  !*** ./~/signalk-client/~/superagent/~/component-emitter/index.js ***!
  \********************************************************************/
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	module.exports = Emitter;
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks[event] = this._callbacks[event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  var self = this;
	  this._callbacks = this._callbacks || {};
	
	  function on() {
	    self.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks[event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks[event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks[event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks[event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 16 */
/*!*******************************************************************!*\
  !*** ./~/signalk-client/~/superagent/~/reduce-component/index.js ***!
  \*******************************************************************/
/***/ function(module, exports) {

	
	/**
	 * Reduce `arr` with `fn`.
	 *
	 * @param {Array} arr
	 * @param {Function} fn
	 * @param {Mixed} initial
	 *
	 * TODO: combatible error handling?
	 */
	
	module.exports = function(arr, fn, initial){  
	  var idx = 0;
	  var len = arr.length;
	  var curr = arguments.length == 3
	    ? initial
	    : arr[idx++];
	
	  while (idx < len) {
	    curr = fn.call(null, curr, arr[idx], ++idx, arr);
	  }
	  
	  return curr;
	};

/***/ },
/* 17 */
/*!****************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/util/util.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }
	
	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};
	
	
	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }
	
	  if (process.noDeprecation === true) {
	    return fn;
	  }
	
	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }
	
	  return deprecated;
	};
	
	
	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};
	
	
	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;
	
	
	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};
	
	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};
	
	
	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];
	
	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}
	
	
	function stylizeNoColor(str, styleType) {
	  return str;
	}
	
	
	function arrayToHash(array) {
	  var hash = {};
	
	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });
	
	  return hash;
	}
	
	
	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }
	
	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }
	
	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);
	
	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }
	
	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }
	
	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }
	
	  var base = '', array = false, braces = ['{', '}'];
	
	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }
	
	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }
	
	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }
	
	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }
	
	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }
	
	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }
	
	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }
	
	  ctx.seen.push(value);
	
	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }
	
	  ctx.seen.pop();
	
	  return reduceToSingleString(output, base, braces);
	}
	
	
	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}
	
	
	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}
	
	
	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}
	
	
	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }
	
	  return name + ': ' + str;
	}
	
	
	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);
	
	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }
	
	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}
	
	
	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;
	
	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;
	
	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;
	
	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;
	
	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;
	
	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;
	
	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;
	
	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;
	
	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;
	
	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;
	
	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;
	
	exports.isBuffer = __webpack_require__(/*! ./support/isBuffer */ 18);
	
	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}
	
	
	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}
	
	
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];
	
	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}
	
	
	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};
	
	
	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(/*! inherits */ 19);
	
	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;
	
	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};
	
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(/*! (webpack)/~/node-libs-browser/~/process/browser.js */ 11)))

/***/ },
/* 18 */
/*!***********************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/util/support/isBufferBrowser.js ***!
  \***********************************************************************/
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 19 */
/*!***************************************************************************!*\
  !*** (webpack)/~/node-libs-browser/~/util/~/inherits/inherits_browser.js ***!
  \***************************************************************************/
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ }
/******/ ]);
//# sourceMappingURL=gauges.js.map