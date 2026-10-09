import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

/// How a design sits on the surface: [cover] fills the whole approved area (XINOBI U pattern); otherwise the image is placed
/// at [offset] (fraction of the photo size from its centre), [scale] (fraction of the photo width) and [rotation] (radians).
@immutable
class DesignPlacement {
  const DesignPlacement.cover() : cover = true, scale = 1, rotation = 0, offset = Offset.zero;
  const DesignPlacement.place({this.scale = 0.4, this.rotation = 0, this.offset = Offset.zero}) : cover = false;
  final bool cover;
  final double scale;
  final double rotation;
  final Offset offset;

  DesignPlacement copyWith({double? scale, double? rotation, Offset? offset}) =>
      DesignPlacement.place(scale: scale ?? this.scale, rotation: rotation ?? this.rotation, offset: offset ?? this.offset);
}

/// The design on a product photo, clipped to the surface the admin approved for that colour (Ürün yüzeyleri); the photo is
/// multiplied over the design so the body keeps its shading. Shows [fallback] until the three images load or when one fails.
class SurfacePreview extends StatefulWidget {
  const SurfacePreview({super.key, required this.product, required this.design, required this.mask, required this.fallback, this.placement = const DesignPlacement.cover()});
  final ImageProvider product;
  final ImageProvider design;
  final ImageProvider mask;
  final Widget fallback;
  final DesignPlacement placement;
  @override
  State<SurfacePreview> createState() => _SurfacePreviewState();
}

class _SurfacePreviewState extends State<SurfacePreview> {
  List<ui.Image>? images;
  bool failed = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(SurfacePreview old) {
    super.didUpdateWidget(old);
    if (old.product != widget.product || old.design != widget.design || old.mask != widget.mask) _load();
  }

  Future<void> _load() async {
    try {
      final loaded = await Future.wait([widget.product, widget.design, widget.mask].map(resolveImage));
      if (mounted) {
        setState(() {
          images = loaded;
          failed = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => failed = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final loaded = images;
    if (failed || loaded == null) return widget.fallback;
    return CustomPaint(painter: SurfacePainter(loaded[0], loaded[1], loaded[2], widget.placement), size: Size.infinite);
  }
}

Future<ui.Image> resolveImage(ImageProvider provider) {
  final done = Completer<ui.Image>();
  final stream = provider.resolve(ImageConfiguration.empty);
  late final ImageStreamListener listener;
  listener = ImageStreamListener((info, _) {
    if (!done.isCompleted) done.complete(info.image);
    stream.removeListener(listener);
  }, onError: (error, stack) {
    if (!done.isCompleted) done.completeError(error, stack);
    stream.removeListener(listener);
  });
  stream.addListener(listener);
  return done.future;
}

/// Where the photo is drawn inside [size] (contained, centred).
Rect photoRect(ui.Image product, Size size) {
  final fitted = applyBoxFit(BoxFit.contain, Size(product.width.toDouble(), product.height.toDouble()), size);
  return Alignment.center.inscribe(fitted.destination, Offset.zero & size);
}

class SurfacePainter extends CustomPainter {
  SurfacePainter(this.product, this.design, this.mask, this.placement);
  final ui.Image product;
  final ui.Image design;
  final ui.Image mask;
  final DesignPlacement placement;

  static Rect _all(ui.Image image) => Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble());

  @override
  void paint(Canvas canvas, Size size) {
    final target = photoRect(product, size);
    final paint = Paint()..filterQuality = FilterQuality.medium;
    canvas.drawImageRect(product, _all(product), target, paint);
    canvas.saveLayer(target, Paint());
    if (placement.cover) {
      final cover = applyBoxFit(BoxFit.cover, Size(design.width.toDouble(), design.height.toDouble()), target.size);
      canvas.drawImageRect(design, Alignment.center.inscribe(cover.source, _all(design)), target, paint);
    } else {
      final width = target.width * placement.scale;
      final height = width * design.height / design.width;
      final centre = target.center + Offset(placement.offset.dx * target.width, placement.offset.dy * target.height);
      canvas.save();
      canvas.translate(centre.dx, centre.dy);
      canvas.rotate(placement.rotation);
      canvas.drawImageRect(design, _all(design), Rect.fromCenter(center: Offset.zero, width: width, height: height), paint);
      canvas.restore();
    }
    canvas.drawImageRect(product, _all(product), target, Paint()..blendMode = BlendMode.multiply..color = const Color(0x73000000));
    canvas.drawImageRect(mask, _all(mask), target, Paint()..blendMode = BlendMode.dstIn);
    canvas.restore();
  }

  @override
  bool shouldRepaint(SurfacePainter old) => old.product != product || old.design != design || old.mask != mask || old.placement != placement;
}

/// Degrees for sliders and labels.
double degrees(double radians) => radians * 180 / math.pi;
