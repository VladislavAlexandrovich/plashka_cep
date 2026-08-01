var comp = null;

function hasActiveComp() {
  var item = app.project.activeItem;
  return item && item instanceof CompItem ? "OK" : "NO_COMP";
}

function getCompCenter() {
  var c = app.project.activeItem;
  if (!c || !(c instanceof CompItem)) return "ERROR";
  return c.width + "," + c.height;
}

function centerLayer(layer) {
  var sr = layer.sourceRectAtTime(0, false);
  var cx = sr.left + sr.width / 2;
  var cy = sr.top + sr.height / 2;
  layer.anchorPoint.setValue([cx, cy, 0]);
  layer.position.setValue([comp.width / 2, comp.height / 2]);
}

function makeTextLayer(text, fontSize, font, color, layerName) {
  var doc = new TextDocument("");
  doc.resetCharStyle();
  doc.text = text;
  doc.fontSize = fontSize;
  doc.font = font;
  doc.fillColor = color;
  doc.applyFill = true;
  doc.applyStroke = false;
  var layer = comp.layers.addText(doc);
  layer.name = layerName;
  return layer;
}

function makeShapeRectLayer(name, rectW, rectH, roundness, fillColor, strokeColor, strokeWidth) {
  var layer = comp.layers.addShape();
  layer.name = name;
  var group = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
  var rect = group.property("Contents").addProperty("ADBE Vector Shape - Rect");
  rect.property("ADBE Vector Rect Size").setValue([rectW, rectH]);
  rect.property("ADBE Vector Rect Position").setValue([0, 0]);
  rect.property("ADBE Vector Rect Roundness").setValue(roundness);
  if (fillColor) {
    var fill = group.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue(fillColor);
  }
  if (strokeColor) {
    var stroke = group.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    stroke.property("ADBE Vector Stroke Color").setValue(strokeColor);
    stroke.property("ADBE Vector Stroke Width").setValue(strokeWidth || 1);
  }
  return layer;
}

function buildGlass(text, counter) {
  comp = app.project.activeItem;
  app.beginUndoGroup("Create Plashka Glass");
  try {
    var textLayer = makeTextLayer(text, 48, "Arial-BoldMT", [1,1,1], "Plashka Glass Text " + counter);
    var tr = textLayer.sourceRectAtTime(0, false);
    var rectW = tr.width + 80, rectH = tr.height + 40;
    var shapeLayer = makeShapeRectLayer("Plashka Glass BG " + counter, rectW, rectH, 20, [1,1,1,0.2], [1,1,1,0.5], 1);
    shapeLayer.moveAfter(textLayer);
    centerLayer(shapeLayer);
    centerLayer(textLayer);
    textLayer.moveAfter(shapeLayer);
    var blur = shapeLayer.property("ADBE Effect Parade").addProperty("ADBE Fast Blur");
    blur.property("ADBE Fast Blur-0001").setValue(15);
    app.endUndoGroup();
    return "OK";
  } catch (e) { app.endUndoGroup(); return "ERROR: " + e.toString(); }
}

function build3D(text, counter) {
  comp = app.project.activeItem;
  app.beginUndoGroup("Create Plashka 3D");
  try {
    var shadowLayer = makeTextLayer(text, 48, "Arial-BoldMT", [0,0.2,0.67], "Plashka Shadow " + counter);
    centerLayer(shadowLayer);
    var sp = shadowLayer.position.value;
    shadowLayer.position.setValue([sp[0]+6, sp[1]+6]);
    var textLayer = makeTextLayer(text, 48, "Arial-BoldMT", [1,1,1], "Plashka 3D " + counter);
    centerLayer(textLayer);
    textLayer.moveAfter(shadowLayer);
    app.endUndoGroup();
    return "OK";
  } catch (e) { app.endUndoGroup(); return "ERROR: " + e.toString(); }
}

function buildNeon(text, counter) {
  comp = app.project.activeItem;
  app.beginUndoGroup("Create Plashka Neon");
  try {
    var textLayer = makeTextLayer(text, 48, "Arial-BoldMT", [1,1,1], "Plashka Neon " + counter);
    var tr = textLayer.sourceRectAtTime(0, false);
    var rectW = tr.width + 60, rectH = tr.height + 30;
    var shapeLayer = makeShapeRectLayer("Plashka Neon BG " + counter, rectW, rectH, 12, [0.04,0.04,0.04], [1,0,1], 2);
    shapeLayer.moveAfter(textLayer);
    centerLayer(shapeLayer);
    centerLayer(textLayer);
    textLayer.moveAfter(shapeLayer);
    var glow = textLayer.property("ADBE Effect Parade").addProperty("ADBE Glo2");
    glow.property("ADBE Glo2-0001").setValue(20);
    glow.property("ADBE Glo2-0002").setValue(30);
    glow.property("ADBE Glo2-0003").setValue(2);
    app.endUndoGroup();
    return "OK";
  } catch (e) { app.endUndoGroup(); return "ERROR: " + e.toString(); }
}

function buildMinimal(text, counter) {
  comp = app.project.activeItem;
  app.beginUndoGroup("Create Plashka Minimal");
  try {
    var textLayer = makeTextLayer(text, 36, "ArialMT", [1,1,1], "Plashka Minimal " + counter);
    var tr = textLayer.sourceRectAtTime(0, false);
    var shapeLayer = makeShapeRectLayer("Plashka Line " + counter, 4, tr.height, 0, [1,1,1], null, 0);
    var totalW = 4 + 20 + tr.width;
    var startX = comp.width / 2 - totalW / 2;
    var sr = shapeLayer.sourceRectAtTime(0, false);
    shapeLayer.anchorPoint.setValue([sr.left+sr.width/2, sr.top+sr.height/2, 0]);
    shapeLayer.position.setValue([startX+2, comp.height/2]);
    textLayer.anchorPoint.setValue([tr.left+tr.width/2, tr.top+tr.height/2, 0]);
    textLayer.position.setValue([startX+4+20+tr.width/2, comp.height/2]);
    textLayer.moveAfter(shapeLayer);
    app.endUndoGroup();
    return "OK";
  } catch (e) { app.endUndoGroup(); return "ERROR: " + e.toString(); }
}

function createPlashka(preset, text, counter) {
  try {
    comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) return "ERROR: No active composition";
    switch(preset) {
      case "glass":   return buildGlass(text, counter);
      case "3d":      return build3D(text, counter);
      case "neon":    return buildNeon(text, counter);
      case "minimal": return buildMinimal(text, counter);
      default:        return "ERROR: Unknown preset";
    }
  } catch (e) { return "ERROR: " + e.toString(); }
}