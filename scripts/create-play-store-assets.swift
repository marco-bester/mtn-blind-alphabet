import AppKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let output = root.appendingPathComponent("assets/store-screenshots")
guard let logo = NSImage(contentsOf: root.appendingPathComponent("assets/images/icon.png")) else {
    fatalError("App icon could not be loaded")
}

func render(name: String, width: Int, height: Int, draw: () -> Void) throws {
    guard let canvas = CGContext(
        data: nil, width: width, height: height, bitsPerComponent: 8,
        bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
    ) else {
        fatalError("Image context could not be created")
    }
    let context = NSGraphicsContext(cgContext: canvas, flipped: false)
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.imageInterpolation = .high
    NSColor(calibratedRed: 1, green: 0.8, blue: 0, alpha: 1).setFill()
    NSRect(x: 0, y: 0, width: CGFloat(width), height: CGFloat(height)).fill()
    draw()
    NSGraphicsContext.restoreGraphicsState()
    guard let image = canvas.makeImage() else {
        fatalError("Image rendering failed")
    }
    let bitmap = NSBitmapImageRep(cgImage: image)
    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        fatalError("PNG encoding failed")
    }
    try data.write(to: output.appendingPathComponent(name), options: .atomic)
    print("Created \(name): \(width)x\(height)")
}

try render(name: "play-icon-512.png", width: 512, height: 512) {
    logo.draw(in: NSRect(x: 0, y: 0, width: 512, height: 512))
}

try render(name: "play-feature-1024x500.png", width: 1024, height: 500) {
    let title = NSAttributedString(string: "Blind\nAlphabet", attributes: [
        .font: NSFont.systemFont(ofSize: 80, weight: .black),
        .foregroundColor: NSColor.black,
        .kern: 0
    ])
    title.draw(in: NSRect(x: 64, y: 140, width: 510, height: 220))
    NSColor.black.setFill()
    NSRect(x: 68, y: 119, width: 94, height: 9).fill()
    logo.draw(in: NSRect(x: 648, y: 100, width: 300, height: 300))
}