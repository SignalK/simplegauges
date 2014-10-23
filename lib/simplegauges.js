function GaugeSet() {
  this.speed = new steelseries.Radial('speedCanvas', {
    gaugeType: steelseries.GaugeType.TYPE4,
    frameDesign: steelseries.FrameDesign.TILTED_BLACK,
    size: 400,
    titleString: "SOG",
    unitString: "knots",
    lcdVisible: true,
    maxValue:10,
    maxMeasuredValue:0,
    maxMeasuredValueVisible:true,
    thresholdVisible:false,
    ledVisible:false,
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
    maxValue:20,
    maxMeasuredValue:0,
    maxMeasuredValueVisible:true,
    thresholdVisible:false,
    ledVisible:false,
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
    "navigation": {
      "speedThroughWater" : function(data) {
        if (data.value != null) {
          this.speed.setValue(data.value);
        }
      }.bind(this),
      "courseOverGroundTrue": function(data) { this.compass.setValue(data.value);}.bind(this)
    },
    "environment": {
      "depth": function(data) { this.depth.setValue(data.value);}.bind(this),
      "windAngleApparent": function(data) { this.wind.setValueLatest(data.value);}.bind(this)
    }
  }
  this.dispatch = this.doDispatch.bind(this);
};

GaugeSet.prototype = {
  dispatchInTree: function (singleSignalK, eventHandlerTree) {
  var branchName = Object.keys(singleSignalK)[0];
  if (typeof eventHandlerTree[branchName] === 'function') {
    eventHandlerTree[branchName](singleSignalK[branchName])
  } else if (typeof eventHandlerTree[branchName] === 'undefined') {
  } else {
    this.dispatchInTree(singleSignalK[branchName], eventHandlerTree[branchName]);
  }
},
doDispatch:function dispatch(data) {
  this.dispatchInTree(data, this.eventHandlers);
}
}



module.exports.GaugeSet = GaugeSet;