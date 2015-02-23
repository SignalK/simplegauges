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
  setSelfId: function(selfId) {
    this.selfId = selfId;
  }
}



module.exports.GaugeSet = GaugeSet;