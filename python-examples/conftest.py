from pathlib import Path

import pytest

MARKER = "# Expected output:\n"


@pytest.fixture
def expected_output(request: pytest.FixtureRequest) -> str:
    """The `# Expected output:` block of the example.py next to the requesting test."""
    source = Path(request.path).with_name("example.py").read_text(encoding="utf-8")
    assert MARKER in source, "example.py must end with an '# Expected output:' block"
    block = source.split(MARKER, 1)[1]
    return "".join(line.removeprefix("#").removeprefix(" ") + "\n" for line in block.splitlines())
