import XCTest
import SwiftTreeSitter
import TreeSitterSpicy

final class TreeSitterSpicyTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_spicy())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Spicy grammar")
    }
}
