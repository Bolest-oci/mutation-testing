import sys
from mutpy import commandline

if __name__ == '__main__':
    sys.path.append(".")
    sys.argv = [
        "mut.py",
        "--target", "discount_calculator",
        "--unit-test", "test_discount_calculator",
        "--runner", "pytest",
        "-m",
        "--report-html", "mutpy_html_report"
    ]
    commandline.main(sys.argv)
