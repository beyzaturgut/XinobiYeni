import 'package:flutter/material.dart';

/// The same vector geometry and colours as web/components/nobi/nobi-mark.tsx.
class NobiMark extends StatelessWidget {
  const NobiMark({super.key, this.width = 62});
  final double width;

  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: SizedBox(
      width: width,
      height: width * 108 / 112,
      child: CustomPaint(painter: _NobiPainter()),
    ),
  );
}

class _NobiPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / 112, size.height / 108);
    canvas.drawLine(const Offset(56, 22), const Offset(56, 35), Paint()
      ..color = const Color(0xffcfcfcf)
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.square);
    canvas.drawCircle(const Offset(56, 14), 10, Paint()..color = const Color(0xffff4054));
    canvas.drawCircle(const Offset(56, 14), 10, Paint()
      ..color = const Color(0xffff91a0)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3);
    final shell = RRect.fromRectAndRadius(const Rect.fromLTWH(13, 31, 86, 68), const Radius.circular(31));
    canvas.drawRRect(shell, Paint()..color = const Color(0xfffffdfd));
    canvas.drawRRect(shell, Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(25, 48, 62, 40), const Radius.circular(17)), Paint()..color = const Color(0xff171717));
    final smile = Path()
      ..moveTo(35, 68)
      ..cubicTo(35, 61, 39, 57, 44, 57)
      ..cubicTo(52, 57, 51, 72, 59, 72)
      ..cubicTo(67, 72, 66, 57, 74, 57)
      ..cubicTo(79, 57, 83, 61, 83, 68);
    canvas.drawPath(smile, Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_NobiPainter oldDelegate) => false;
}
