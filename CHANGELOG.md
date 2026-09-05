# Changelog — Stride

All notable changes to this project are tracked here. Version numbers refer to `APP_VERSION` in `src/views/AccountView.vue`.

## [Unreleased]

## [1.1.4]
- Fix: bottom tab bar disappeared while browsing a notes folder — it now only hides inside the note editor itself.
- Fix: creating a new notes folder relied on Enter or losing focus to save; it now has explicit confirm/cancel buttons like the task add-row.

## [1.1.3]
- Fix: moving a task to a new date via the edit form's top confirm checkmark did nothing — only the move panel's own checkmark applied the date change. Both now move the task.

## [1.1.2]
- Fix category hours progress bar to reflect completion %.

## [1.1.1]
- Fix category hours breakdown to show done/planned.

## [1.1.0]
- Add time tracked per category.
