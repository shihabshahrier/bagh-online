"""Tkinter-based GUI frontend for Bagh Lang."""

from __future__ import annotations

import io
import os
import sys
import tkinter as tk
from contextlib import redirect_stdout, redirect_stderr
from pathlib import Path
from tkinter import filedialog, messagebox, simpledialog, ttk

try:  # pragma: no cover - pyinstaller fallback
    from .resources import iter_branding_banner, logo_file
    from .runtime import BaghRuntimeError, run_bagh_code
except ImportError:  # pragma: no cover - executed when package context missing
    from bagh_lang.resources import iter_branding_banner, logo_file
    from bagh_lang.runtime import BaghRuntimeError, run_bagh_code


class BaghApp(ttk.Frame):
    """Main application frame."""

    def __init__(self, master: tk.Tk) -> None:
        super().__init__(master, padding=10)
        self.master = master
        self.pack(fill=tk.BOTH, expand=True)
        self._current_path: Path | None = None
        self._logo_image: tk.PhotoImage | None = None
        self.workspace_root = Path.cwd()

        self._build_ui()
        self._load_banner()

    # UI setup -----------------------------------------------------------------

    def _build_ui(self) -> None:
        self.master.title("Bagh Studio")
        self.master.geometry("1100x720")
        self.master.minsize(860, 560)

        self._configure_icon()
        self._build_menu()
        self._apply_styles()

        main_split = ttk.Panedwindow(self, orient=tk.HORIZONTAL)
        main_split.pack(fill=tk.BOTH, expand=True)

        # Sidebar ----------------------------------------------------------------
        sidebar = ttk.Frame(main_split, padding=(10, 10, 6, 10))
        main_split.add(sidebar, weight=1)
        ttk.Label(sidebar, text="Workspace", style="SidebarHeading.TLabel").pack(
            anchor="w", pady=(0, 10)
        )

        tree_frame = ttk.Frame(sidebar)
        tree_frame.pack(fill=tk.BOTH, expand=True)
        self.tree = ttk.Treeview(tree_frame, show="tree", selectmode="browse")
        tree_scroll = ttk.Scrollbar(
            tree_frame, orient=tk.VERTICAL, command=self.tree.yview
        )
        self.tree.configure(yscrollcommand=tree_scroll.set)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        tree_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.tree.bind("<Double-1>", lambda _evt: self._open_selected_from_tree())

        sidebar_buttons = ttk.Frame(sidebar)
        sidebar_buttons.pack(fill=tk.X, pady=(10, 0))
        ttk.Button(sidebar_buttons, text="নতুন ফাইল", command=self.create_file).pack(
            fill=tk.X, pady=2
        )
        ttk.Button(sidebar_buttons, text="মুছে ফেলো", command=self.delete_selected).pack(
            fill=tk.X, pady=2
        )
        ttk.Button(sidebar_buttons, text="রিফ্রেশ", command=self.refresh_tree).pack(
            fill=tk.X, pady=2
        )

        # Main content -----------------------------------------------------------
        content = ttk.Frame(main_split, padding=(10, 10, 10, 10))
        main_split.add(content, weight=5)

        toolbar = ttk.Frame(content)
        toolbar.pack(fill=tk.X, pady=(0, 10))
        ttk.Button(
            toolbar, text="▶ রান করো", style="Accent.TButton", command=self.run_code
        ).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(toolbar, text="নতুন", command=self.new_file).pack(
            side=tk.LEFT, padx=4
        )
        ttk.Button(toolbar, text="খুলো…", command=self.open_file).pack(
            side=tk.LEFT, padx=4
        )
        ttk.Button(toolbar, text="সংরক্ষণ", command=self.save_file).pack(
            side=tk.LEFT, padx=4
        )
        ttk.Button(toolbar, text="আউটপুট পরিষ্কার", command=self.clear_output).pack(
            side=tk.LEFT, padx=4
        )

        content_split = ttk.Panedwindow(content, orient=tk.VERTICAL)
        content_split.pack(fill=tk.BOTH, expand=True)

        editor_frame = ttk.Frame(content_split)
        output_frame = ttk.Frame(content_split)
        content_split.add(editor_frame, weight=3)
        content_split.add(output_frame, weight=2)

        self.editor = tk.Text(
            editor_frame,
            wrap=tk.NONE,
            font=("Menlo", 13),
            undo=True,
            tabs=("2c"),
        )
        editor_scroll_y = ttk.Scrollbar(
            editor_frame, orient=tk.VERTICAL, command=self.editor.yview
        )
        editor_scroll_x = ttk.Scrollbar(
            editor_frame, orient=tk.HORIZONTAL, command=self.editor.xview
        )
        self.editor.configure(
            yscrollcommand=editor_scroll_y.set, xscrollcommand=editor_scroll_x.set
        )
        editor_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        editor_scroll_x.pack(side=tk.BOTTOM, fill=tk.X)
        self.editor.pack(fill=tk.BOTH, expand=True)

        self.output = tk.Text(
            output_frame,
            wrap=tk.WORD,
            height=10,
            font=("Menlo", 12),
            state=tk.DISABLED,
            background="#10141c",
            foreground="#e8f1ff",
        )
        out_scroll_y = ttk.Scrollbar(
            output_frame, orient=tk.VERTICAL, command=self.output.yview
        )
        self.output.configure(yscrollcommand=out_scroll_y.set)
        out_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        self.output.pack(fill=tk.BOTH, expand=True)

        status_frame = ttk.Frame(content, padding=(0, 8, 0, 0))
        status_frame.pack(fill=tk.X)
        self.status_var = tk.StringVar(value="Ready to create!")
        ttk.Label(status_frame, textvariable=self.status_var).pack(side=tk.LEFT)

        self.refresh_tree()

    def _configure_icon(self) -> None:
        try:
            with logo_file() as path:
                self._logo_image = tk.PhotoImage(file=str(path))
                self.master.iconphoto(True, self._logo_image)
        except Exception:  # pragma: no cover - optional
            self._logo_image = None

    def _apply_styles(self) -> None:
        style = ttk.Style(self.master)
        if sys.platform == "darwin":
            style.theme_use("aqua")
        else:
            try:
                style.theme_use("clam")
            except tk.TclError:
                pass

        style.configure("SidebarHeading.TLabel", font=("SF Pro Display", 13, "bold"))
        style.configure(
            "Accent.TButton",
            font=("SF Pro Text", 11, "bold"),
            padding=6,
        )

    def _build_menu(self) -> None:
        menu = tk.Menu(self.master)
        file_menu = tk.Menu(menu, tearoff=0)
        file_menu.add_command(label="New", command=self.new_file, accelerator="Cmd+N")
        file_menu.add_command(label="Open…", command=self.open_file, accelerator="Cmd+O")
        file_menu.add_command(label="Save", command=self.save_file, accelerator="Cmd+S")
        file_menu.add_command(
            label="Save As…", command=self.save_file_as, accelerator="Shift+Cmd+S"
        )
        file_menu.add_separator()
        file_menu.add_command(label="Refresh Workspace", command=self.refresh_tree)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.master.quit)
        menu.add_cascade(label="File", menu=file_menu)

        run_menu = tk.Menu(menu, tearoff=0)
        run_menu.add_command(label="Run ▶", command=self.run_code, accelerator="Cmd+Enter")
        run_menu.add_command(label="Clear Output", command=self.clear_output)
        menu.add_cascade(label="Run", menu=run_menu)

        help_menu = tk.Menu(menu, tearoff=0)
        help_menu.add_command(label="About", command=self.show_about)
        menu.add_cascade(label="Help", menu=help_menu)

        self.master.config(menu=menu)

        self.master.bind_all("<Command-n>", lambda _: self.new_file())
        self.master.bind_all("<Command-o>", lambda _: self.open_file())
        self.master.bind_all("<Command-s>", lambda _: self.save_file())
        self.master.bind_all(
            "<Shift-Command-S>", lambda _: self.save_file_as()
        )
        self.master.bind_all("<Command-Return>", lambda _: self.run_code())

    def _load_banner(self) -> None:
        self.editor.delete("1.0", tk.END)
        starter = (
            "🐯 স্বাগতম Bagh Studio তে!\n"
            "আজকের চ্যালেঞ্জ: তোমার প্রথম প্রোগ্রাম লিখো।\n\n"
            "লিখো(\"হ্যালো বাঘ! 🐯\")\n"
        )
        self.editor.insert(tk.END, starter)
        self.editor.edit_modified(False)
        self.status_var.set("Ready to create!")

    # File operations ----------------------------------------------------------

    def new_file(self) -> None:
        if not self._confirm_discard_changes():
            return
        self.editor.delete("1.0", tk.END)
        self.editor.insert(tk.END, 'লিখো("নতুন গল্প শুরু!")\n')
        self.editor.edit_modified(False)
        self.output.configure(state=tk.NORMAL)
        self.output.delete("1.0", tk.END)
        self.output.configure(state=tk.DISABLED)
        self._current_path = None
        self.status_var.set("Blank canvas ready")

    def open_file(self) -> None:
        if not self._confirm_discard_changes():
            return
        filepath = filedialog.askopenfilename(
            title="Open Bagh Lang File",
            filetypes=[("Bagh Lang", "*.bg"), ("All Files", "*.*")],
            initialdir=self.workspace_root,
        )
        if not filepath:
            return
        self._open_path(Path(filepath))

    def save_file(self) -> None:
        if self._current_path is None:
            self.save_file_as()
            return
        self._write_to_path(self._current_path)

    def save_file_as(self) -> None:
        filepath = filedialog.asksaveasfilename(
            title="Save Bagh Lang File",
            defaultextension=".bg",
            filetypes=[("Bagh Lang", "*.bg"), ("All Files", "*.*")],
            initialdir=self.workspace_root,
        )
        if not filepath:
            return
        self._current_path = Path(filepath)
        self._write_to_path(self._current_path)
        self.refresh_tree()

    def _write_to_path(self, path: Path) -> None:
        try:
            path.write_text(self.editor.get("1.0", tk.END), encoding="utf-8")
            self.status_var.set(f"Saved {path.name}")
            self.editor.edit_modified(False)
        except Exception as exc:  # pragma: no cover - filesystem guard
            messagebox.showerror("Save failed", str(exc))

    def _confirm_discard_changes(self) -> bool:
        if self.editor.edit_modified():
            result = messagebox.askyesno(
                "Discard changes?", "বর্তমান পরিবর্তনগুলো সংরক্ষণ করা হয়নি। এগোবে?"
            )
            if not result:
                return False
        self.editor.edit_modified(False)
        return True

    # Execution ----------------------------------------------------------------

    def run_code(self) -> None:
        source = self.editor.get("1.0", tk.END)
        stdio_buffer = io.StringIO()
        try:
            with redirect_stdout(stdio_buffer), redirect_stderr(stdio_buffer):
                run_bagh_code(source, filename=str(self._current_path or "<gui>"))
        except BaghRuntimeError as exc:
            self._append_output(str(exc) + "\n", error=True)
            self.status_var.set("Execution failed")
            return
        except Exception as exc:  # pragma: no cover - runtime guard
            self._append_output(f"Unexpected error: {exc}\n", error=True)
            self.status_var.set("Execution failed")
            return

        output_text = stdio_buffer.getvalue().strip()
        if not output_text:
            output_text = "(কোন আউটপুট নেই)\n"
        else:
            output_text += "\n"
        self._append_output(output_text)
        self.status_var.set("Execution completed")

    def clear_output(self) -> None:
        self.output.configure(state=tk.NORMAL)
        self.output.delete("1.0", tk.END)
        self.output.configure(state=tk.DISABLED)
        self.status_var.set("Output cleared")

    def _append_output(self, text: str, *, error: bool = False) -> None:
        self.output.configure(state=tk.NORMAL)
        tag = "error" if error else "normal"
        if tag not in self.output.tag_names():
            self.output.tag_configure("error", foreground="#ff6b6b")
            self.output.tag_configure("normal", foreground="#e8f1ff")
        self.output.insert(tk.END, text, tag)
        self.output.see(tk.END)
        self.output.configure(state=tk.DISABLED)

    # Help ---------------------------------------------------------------------

    def show_about(self) -> None:
        lines = list(iter_branding_banner())
        info = "\n".join(lines + ["", "Created with ❤️ for curious learners."])
        messagebox.showinfo("About Bagh Lang", info)

    # Workspace browser --------------------------------------------------------

    def refresh_tree(self) -> None:
        self.tree.delete(*self.tree.get_children())
        root_id = self._iid_for_path(self.workspace_root)
        self.tree.insert(
            "",
            "end",
            iid=root_id,
            text=self.workspace_root.name,
            open=True,
        )
        self._populate_children(self.workspace_root, root_id)

    def _populate_children(self, directory: Path, parent_id: str) -> None:
        try:
            entries = sorted(
                directory.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())
            )
        except PermissionError:  # pragma: no cover - guard
            return
        for entry in entries:
            rel_id = self._iid_for_path(entry)
            if entry.is_dir():
                node = self.tree.insert(
                    parent_id, "end", iid=rel_id, text=entry.name, open=False
                )
                self._populate_children(entry, node)
            elif entry.suffix == ".bg":
                self.tree.insert(parent_id, "end", iid=rel_id, text=entry.name)

    def _iid_for_path(self, path: Path) -> str:
        if path == self.workspace_root:
            return "."
        rel = path.relative_to(self.workspace_root)
        return str(rel).replace(os.sep, "/")

    def _path_from_iid(self, iid: str) -> Path:
        if iid in {"", "."}:
            return self.workspace_root
        return self.workspace_root / Path(iid)

    def _open_selected_from_tree(self) -> None:
        sel = self.tree.selection()
        if not sel:
            return
        target = self._path_from_iid(sel[0])
        if target.is_dir():
            self.tree.item(sel[0], open=not self.tree.item(sel[0], "open"))
            return
        if target.suffix != ".bg":
            return
        if not self._confirm_discard_changes():
            return
        self._open_path(target)

    def create_file(self) -> None:
        target_dir = self._selected_directory()
        name = simpledialog.askstring(
            "নতুন ফাইল তৈরি", "ফাইলের নাম লিখো (যেমন গল্প):", parent=self
        )
        if not name:
            return
        name = name.strip()
        if not name:
            return
        if not name.endswith(".bg"):
            name += ".bg"
        new_path = target_dir / name
        if new_path.exists():
            messagebox.showerror("ফাইল আছে", f"{new_path.name} ইতিমধ্যেই আছে।")
            return
        template = 'লিখো("হ্যালো পৃথিবী! 🐯")\n'
        try:
            new_path.write_text(template, encoding="utf-8")
        except Exception as exc:  # pragma: no cover - filesystem guard
            messagebox.showerror("লেখা যায়নি", str(exc))
            return
        self.refresh_tree()
        self._open_path(new_path)

    def delete_selected(self) -> None:
        sel = self.tree.selection()
        if not sel:
            messagebox.showinfo("কিছুই নির্বাচিত নয়", "যে ফাইলটি মুছতে চাও সেটি নির্বাচন করো।")
            return
        target = self._path_from_iid(sel[0])
        if target.is_dir():
            messagebox.showwarning("শুধু ফাইল মুছবে", "এখন শুধু ফাইল মুছতে পারো।")
            return
        if not target.exists():
            return
        if not messagebox.askyesno("ফাইল মুছবে?", f"{target.name} মুছে ফেলতে চাও?"):
            return
        try:
            target.unlink()
        except Exception as exc:  # pragma: no cover
            messagebox.showerror("মুছতে ব্যর্থ", str(exc))
            return
        if self._current_path == target:
            self.new_file()
        self.refresh_tree()

    def _selected_directory(self) -> Path:
        sel = self.tree.selection()
        if not sel:
            return self.workspace_root
        path = self._path_from_iid(sel[0])
        if path.is_dir():
            return path
        return path.parent

    # Helpers ------------------------------------------------------------------

    def _open_path(self, path: Path) -> None:
        try:
            text = path.read_text(encoding="utf-8")
        except Exception as exc:  # pragma: no cover
            messagebox.showerror("খোলা যায়নি", str(exc))
            return
        self.editor.delete("1.0", tk.END)
        self.editor.insert(tk.END, text)
        self.editor.edit_modified(False)
        self._current_path = path
        self.status_var.set(f"Opened {path.name}")


def main() -> int:
    try:
        root = tk.Tk()
    except Exception as exc:  # pragma: no cover - GUI guard
        print(f"Failed to start GUI: {exc}", file=sys.stderr)
        return 1

    app = BaghApp(root)
    app.mainloop()
    return 0


if __name__ == "__main__":  # pragma: no cover - entry point
    raise SystemExit(main())
