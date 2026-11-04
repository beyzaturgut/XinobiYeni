// Independent software barcode check. This is not physical printer/branch acceptance.
// Usage: swift tools/verify-surat-label-macos.swift rendered-fixture.png fixture.svg
import Foundation
import AppKit
import Vision

enum VerificationError: Error { case invalidFixture, mismatch }
func verify() throws {
    guard CommandLine.arguments.count == 3,
          let image = NSImage(contentsOfFile: CommandLine.arguments[1]) else { throw VerificationError.invalidFixture }
    var rect = CGRect(origin: .zero, size: image.size)
    guard let cg = image.cgImage(forProposedRect: &rect, context: nil, hints: nil) else { throw VerificationError.invalidFixture }
    let svg = try String(contentsOfFile: CommandLine.arguments[2], encoding: .utf8)
    let pattern = try NSRegularExpression(pattern: "Referans: ([^<]+)")
    guard let match = pattern.firstMatch(in: svg, range: NSRange(svg.startIndex..., in: svg)),
          let range = Range(match.range(at: 1), in: svg) else { throw VerificationError.invalidFixture }
    let request = VNDetectBarcodesRequest()
    request.symbologies = [.code128]
    try VNImageRequestHandler(cgImage: cg, options: [:]).perform([request])
    let values = request.results?.compactMap { $0.payloadStringValue } ?? []
    guard values.count == 1, values[0] == String(svg[range]) else { throw VerificationError.mismatch }
    print("PASS: independent Vision Code128 decoder matches fixture label reference")
}
do { try verify() }
catch { print("FAIL: fixture unavailable or barcode/reference mismatch"); exit(1) }
