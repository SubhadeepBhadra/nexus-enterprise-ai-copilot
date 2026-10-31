"""
Nexus Enterprise AI Copilot - Streamlit Cloud Runner
Wraps and serves the full production-grade Enterprise AI Copilot inside Streamlit.
"""

import os
import streamlit as st
import streamlit.components.v1 as components

# 1. Configure Streamlit Page
st.set_page_config(
    page_title="Nexus Enterprise AI Copilot",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 2. Inject CSS to remove Streamlit container paddings and maximize viewport
st.markdown(
    """
    <style>
        #MainMenu { visibility: hidden; }
        footer { visibility: hidden; }
        header { visibility: hidden; }
        .stApp {
            background-color: #F8FAFC;
        }
        .block-container {
            padding-top: 0rem !important;
            padding-bottom: 0rem !important;
            padding-left: 0rem !important;
            padding-right: 0rem !important;
            max-width: 100% !important;
        }
        iframe {
            width: 100% !important;
            min-height: 940px !important;
            height: 98vh !important;
            border: none !important;
        }
    </style>
    """,
    unsafe_allow_html=True
)

@st.cache_data
def get_bundled_html():
    """
    Reads index.html and inlines css/styles.css and all JS modules into a single
    self-contained string for zero-dependency execution in Streamlit.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(base_dir, "index.html")
    css_path = os.path.join(base_dir, "css", "styles.css")

    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Inline CSS
    if os.path.exists(css_path):
        with open(css_path, "r", encoding="utf-8") as f:
            css = f.read()
        html = html.replace(
            '<link rel="stylesheet" href="css/styles.css">',
            f'<style>\n{css}\n</style>'
        )

    # Inline JavaScript Modules in Dependency Order
    js_modules = ["data.js", "rag.js", "agents.js", "analytics.js", "app.js"]
    for js_file in js_modules:
        js_path = os.path.join(base_dir, "js", js_file)
        if os.path.exists(js_path):
            with open(js_path, "r", encoding="utf-8") as f:
                js_content = f.read()
            html = html.replace(
                f'<script src="js/{js_file}"></script>',
                f'<script>\n{js_content}\n</script>'
            )

    return html

# 3. Render Bundled Application in Full Viewport
bundled_app = get_bundled_html()
components.html(bundled_app, height=940, scrolling=True)
