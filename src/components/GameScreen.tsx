import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { CrosswordCell, CrosswordWord, Word } from "@/types/game";
import { Button, Dialog } from "@/components/Dialog";
import { Sheet } from "@/components/Sheet";
import { HowToPlay } from "@/components/HowToPlay";
import { LetterTile, TileState } from "@/components/LetterTile";
import { LiveRegion } from "@/components/LiveRegion";
import { ExampleCard, ExampleSentence } from "@/components/ExampleCard";
import { useSettingsStore } from "@/store/settingsStore";
import { generateForSettings } from "@/utils/newPuzzle";
import { colors, latin, webFocus, radius, space, type } from "@/theme";
import {
  CellPos,
  isCellLocked,
  wordCells,
  wordStatus,
} from "@/utils/wordState";
import { announce } from "@/utils/announce";

type Direction = CrosswordWord["direction"];

const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"].map((r) =>
  r.split(""),
);
const WIDE_BREAKPOINT = 768;
const BOARD_PAD = 6;
const DIR_NAME: Record<Direction, string> = {
  horizontal: "横",
  vertical: "纵",
};

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export const GameScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const {
    currentPuzzle: puzzle,
    currentSession: session,
    currentSettings,
    updateCell,
    revealHint,
    resetGame,
    startGame,
  } = useGameStore();

  const [selected, setSelected] = useState<CellPos | null>(null);
  const [direction, setDirection] = useState<Direction>("horizontal");
  const [confirmExit, setConfirmExit] = useState(false);
  const [cluesOpen, setCluesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [gridBox, setGridBox] = useState({ width: 0, height: 0 });
  // 刚答对、正在展示例句的单词
  const [example, setExample] = useState<Word | null>(null);
  const { tenses, vosotros } = useSettingsStore();

  // 例句卡片 6 秒后自动收起
  useEffect(() => {
    if (!example) return;
    const t = setTimeout(() => setExample(null), 6000);
    return () => clearTimeout(t);
  }, [example]);

  const cells = session?.currentCells;
  const words = useMemo(
    () =>
      puzzle
        ? [...puzzle.words].sort((a, b) => a.clueNumber - b.clueNumber)
        : [],
    [puzzle],
  );

  const statusOf = useCallback(
    (w: CrosswordWord) => (cells ? wordStatus(cells, w) : "empty"),
    [cells],
  );
  const doneCount = words.filter((w) => statusOf(w) === "correct").length;

  // ---------- 选中与导航 ----------

  const activeWord = useMemo(() => {
    if (!selected || !puzzle) return null;
    const containing = puzzle.words.filter((w) =>
      wordCells(w).some(
        (c) => c.row === selected.row && c.col === selected.col,
      ),
    );
    return (
      containing.find((w) => w.direction === direction) ?? containing[0] ?? null
    );
  }, [selected, direction, puzzle]);

  const activeCells = useMemo(
    () =>
      new Set(
        activeWord ? wordCells(activeWord).map((c) => `${c.row}-${c.col}`) : [],
      ),
    [activeWord],
  );

  const locked = useCallback(
    (p: CellPos) => !!cells && !!puzzle && isCellLocked(cells, puzzle.words, p),
    [cells, puzzle],
  );

  const selectWord = useCallback(
    (word: CrosswordWord) => {
      if (!cells) return;
      setDirection(word.direction);
      const ps = wordCells(word);
      const firstEmpty = ps.find(
        (p) => !locked(p) && !cells[p.row][p.col].letter,
      );
      const firstEditable = ps.find((p) => !locked(p));
      setSelected(firstEmpty ?? firstEditable ?? ps[0]);
    },
    [cells, locked],
  );

  // 进入关卡时自动选中第一个词，不出现"先点格子"的空状态
  // （换关卡时在渲染阶段直接设置初始状态，不用 effect）
  const puzzleId = puzzle?.id;
  const [seenPuzzleId, setSeenPuzzleId] = useState<string | undefined>(
    undefined,
  );
  if (puzzleId !== seenPuzzleId) {
    setSeenPuzzleId(puzzleId);
    if (words.length > 0) selectWord(words[0]);
  }

  const nextWord = useCallback(
    (from: CrosswordWord | null, delta: 1 | -1, onlyUnfinished = true) => {
      if (words.length === 0) return null;
      const start = from ? words.indexOf(from) : -1;
      for (let k = 1; k <= words.length; k++) {
        const w = words[(start + delta * k + words.length * 2) % words.length];
        if (!onlyUnfinished || statusOf(w) !== "correct") return w;
      }
      return null;
    },
    [words, statusOf],
  );

  const moveWithinWord = useCallback(
    (from: CellPos, delta: 1 | -1) => {
      if (!activeWord) return null;
      const ps = wordCells(activeWord);
      let i =
        ps.findIndex((c) => c.row === from.row && c.col === from.col) + delta;
      while (i >= 0 && i < ps.length) {
        if (!locked(ps[i])) return ps[i];
        i += delta;
      }
      return null;
    },
    [activeWord, locked],
  );

  const handleCellPress = (cell: CrosswordCell) => {
    if (!cell.correctLetter || !puzzle) return;
    if (
      selected?.row === cell.row &&
      selected?.col === cell.col &&
      cell.wordIds.length > 1
    ) {
      setDirection((d) => (d === "horizontal" ? "vertical" : "horizontal"));
      return;
    }
    if (
      !activeCells.has(`${cell.row}-${cell.col}`) &&
      cell.wordIds.length === 1
    ) {
      const owner = puzzle.words.find((w) => w.id === cell.wordIds[0]);
      if (owner) setDirection(owner.direction);
    }
    setSelected({ row: cell.row, col: cell.col });
  };

  // ---------- 输入 ----------

  // 单词刚好答对时：播报，并在短暂停顿后跳到下一个没完成的词
  const prevStatus = useRef<Record<string, string>>({});
  useEffect(() => {
    if (!cells) return;
    for (const w of words) {
      const s = wordStatus(cells, w);
      const before = prevStatus.current[w.id];
      if (before && before !== s) {
        if (s === "correct") {
          announce(
            `${w.clueNumber}${DIR_NAME[w.direction]} ${w.wordData.spanish}，正确。${w.wordData.exampleSentence ?? ""} ${w.wordData.exampleTranslation ?? ""}`,
          );
          const word = w.wordData;
          if (word.exampleSentence) setTimeout(() => setExample(word), 0);
          if (activeWord?.id === w.id) {
            const next = nextWord(w, 1);
            if (next) setTimeout(() => selectWord(next), 350);
          }
        } else if (s === "wrong") {
          announce(
            `${w.clueNumber}${DIR_NAME[w.direction]} 还不对，红色的字母需要修改`,
          );
        }
      }
      prevStatus.current[w.id] = s;
    }
  }, [cells, words, activeWord, nextWord, selectWord]);

  useEffect(() => {
    prevStatus.current = {};
  }, [puzzleId]);

  const handleLetter = useCallback(
    (letter: string) => {
      if (!selected || !cells) return;
      const target = locked(selected) ? moveWithinWord(selected, 1) : selected;
      if (!target) return;
      updateCell(target.row, target.col, letter);
      setSelected(moveWithinWord(target, 1) ?? target);
    },
    [selected, cells, locked, moveWithinWord, updateCell],
  );

  const handleDelete = useCallback(() => {
    if (!selected || !cells) return;
    if (!locked(selected) && cells[selected.row][selected.col].letter) {
      updateCell(selected.row, selected.col, "");
      return;
    }
    const prev = moveWithinWord(selected, -1);
    if (prev) {
      updateCell(prev.row, prev.col, "");
      setSelected(prev);
    }
  }, [selected, cells, locked, moveWithinWord, updateCell]);

  const handleHint = () => {
    if (!activeWord || !cells) return;
    const target =
      selected &&
      !locked(selected) &&
      cells[selected.row][selected.col].letter !==
        cells[selected.row][selected.col].correctLetter
        ? selected
        : wordCells(activeWord).find(
            (p) =>
              !locked(p) &&
              cells[p.row][p.col].letter !== cells[p.row][p.col].correctLetter,
          );
    if (!target) return;
    const revealed = revealHint(target);
    if (revealed) {
      const letter = cells[revealed.row][revealed.col].correctLetter;
      announce(`已提示 ${letter}`);
      setSelected(moveWithinWord(revealed, 1) ?? revealed);
    }
  };

  const anyOverlay =
    confirmExit || cluesOpen || helpOpen || !!session?.isCompleted;

  // 电脑/网页端：实体键盘输入、方向键移动、空格切换方向
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (anyOverlay || e.isComposing || e.key === "Process") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      if (
        (e.key === "Enter" || e.key === " ") &&
        t &&
        t.getAttribute("role") === "button"
      )
        return;

      if (e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === " ") {
        e.preventDefault();
        setDirection((d) => (d === "horizontal" ? "vertical" : "horizontal"));
      } else if (e.key.startsWith("Arrow") && selected && cells) {
        e.preventDefault();
        const [dr, dc] =
          e.key === "ArrowUp"
            ? [-1, 0]
            : e.key === "ArrowDown"
              ? [1, 0]
              : e.key === "ArrowLeft"
                ? [0, -1]
                : [0, 1];
        setDirection(dr === 0 ? "horizontal" : "vertical");
        let r = selected.row + dr;
        let c = selected.col + dc;
        while (cells[r]?.[c]) {
          if (cells[r][c].correctLetter) {
            setSelected({ row: r, col: c });
            break;
          }
          r += dr;
          c += dc;
        }
      } else if (/^[a-zA-ZñÑáéíóúüÁÉÍÓÚÜ]$/.test(e.key)) {
        handleLetter(e.key.toUpperCase());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [anyOverlay, handleLetter, handleDelete, selected, cells]);

  // ---------- 退出与再来一局 ----------

  const goHome = useCallback(() => {
    setConfirmExit(false);
    resetGame();
    router.replace("/");
  }, [resetGame, router]);

  const userTyped = !!cells?.some((r) => r.some((c) => c.letter && !c.isFixed));
  const requestExit = () =>
    userTyped && !session?.isCompleted ? setConfirmExit(true) : goHome();

  const playAgain = () => {
    if (!currentSettings) return goHome();
    const next = generateForSettings(currentSettings, { tenses, vosotros });
    if (!next) return goHome();
    setSelected(null);
    setExample(null);
    startGame(next, currentSettings);
  };

  // ---------- 尺寸 ----------

  const onGridLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setGridBox({ width: w, height: h });
  };

  const rows = puzzle?.rows ?? 1;
  const cols = puzzle?.cols ?? 1;
  const fit = (box: number, n: number, g: number) =>
    Math.floor((box - space.lg - BOARD_PAD * 2 - g * (n - 1)) / n);
  let gap = 4;
  let cellSize = Math.min(
    48,
    fit(gridBox.width, cols, gap),
    fit(gridBox.height, rows, gap),
  );
  if (cellSize < 32) {
    gap = 3;
    cellSize = Math.min(
      48,
      fit(gridBox.width, cols, gap),
      fit(gridBox.height, rows, gap),
    );
  }
  cellSize = Math.max(20, cellSize);

  const keyboardWidth = Math.min(wide ? 560 : width, 560);
  const keyGap = 6;
  const keyWidth = Math.floor((keyboardWidth - space.sm * 2 - keyGap * 9) / 10);

  // ---------- 渲染 ----------

  if (!puzzle || !session || !cells) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>没有进行中的关卡</Text>
        <Button label="返回主页" variant="primary" onPress={goHome} />
      </SafeAreaView>
    );
  }

  const clueNumberAt = new Map(
    words.map((w) => [`${w.startRow}-${w.startCol}`, w.clueNumber]),
  );

  const cellState = (cell: CrosswordCell): TileState => {
    const key = `${cell.row}-${cell.col}`;
    const owners = words.filter((w) => cell.wordIds.includes(w.id));
    if (selected?.row === cell.row && selected?.col === cell.col)
      return "selected";
    if (owners.some((w) => statusOf(w) === "correct")) return "correct";
    if (
      owners.some((w) => statusOf(w) === "wrong") &&
      cell.letter !== cell.correctLetter
    )
      return "wrong";
    if (activeCells.has(key)) return "active";
    if (cell.isFixed) return "hint";
    return "default";
  };

  const cellLabel = (cell: CrosswordCell) => {
    const parts = words
      .filter((w) => cell.wordIds.includes(w.id))
      .map((w) => {
        const ps = wordCells(w);
        const i = ps.findIndex((p) => p.row === cell.row && p.col === cell.col);
        return `${w.clueNumber}${DIR_NAME[w.direction]}第 ${i + 1} 个字母，共 ${ps.length} 个`;
      });
    const state = cellState(cell);
    const extra = [
      cell.letter ?? "空",
      cell.isFixed ? (cell.revealed ? "提示揭示" : "给出的字母") : null,
      state === "wrong" ? "错误" : null,
      state === "correct" ? "已答对" : null,
    ].filter(Boolean);
    return [...parts, ...extra].join("，");
  };

  const clueText = (w: CrosswordWord) =>
    `${w.wordData.chinese} · ${w.wordData.english}`;

  const renderGrid = () => (
    <View style={styles.gridArea} onLayout={onGridLayout}>
      {gridBox.width > 0 && (
        <View
          style={[styles.board, { gap }]}
          role="grid"
          aria-label={`填字棋盘，${rows} 乘 ${cols}`}
        >
          {cells.map((row, r) => (
            <View key={r} style={[styles.row, { gap }]}>
              {row.map((cell) => {
                const key = `${cell.row}-${cell.col}`;
                if (!cell.correctLetter) {
                  // 没有字母的格子：棋盘上的凹槽，拼成完整的正方形
                  return (
                    <View
                      key={key}
                      style={[
                        styles.blocked,
                        {
                          width: cellSize,
                          height: cellSize,
                          borderRadius: Math.round(cellSize * 0.16),
                        },
                      ]}
                    />
                  );
                }
                const state = cellState(cell);
                return (
                  <Pressable
                    key={key}
                    role="button"
                    aria-label={cellLabel(cell)}
                    aria-selected={state === "selected"}
                    tabIndex={-1}
                    onPress={() => handleCellPress(cell)}
                  >
                    <LetterTile
                      size={cellSize}
                      letter={cell.letter}
                      number={clueNumberAt.get(key)}
                      state={state}
                      revealed={cell.revealed}
                    />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderClueList = () => (
    <View style={styles.clueList}>
      {(["horizontal", "vertical"] as Direction[]).map((dir) => (
        <View key={dir} style={styles.clueGroup}>
          <Text role="heading" style={styles.clueGroupTitle}>
            {dir === "horizontal" ? "横向 →" : "纵向 ↓"}
          </Text>
          {words
            .filter((w) => w.direction === dir)
            .map((w) => {
              const s = statusOf(w);
              const active = activeWord?.id === w.id;
              return (
                <Pressable
                  key={w.id}
                  role="button"
                  aria-selected={active}
                  aria-label={`${w.clueNumber}${DIR_NAME[w.direction]}，${wordCells(w).length} 个字母，${clueText(w)}${s === "correct" ? "，已完成" : ""}`}
                  onPress={() => {
                    selectWord(w);
                    setCluesOpen(false);
                  }}
                  style={(st) => [
                    styles.clueItem,
                    active && styles.clueItemActive,
                    st.pressed && styles.clueItemPressed,
                    webFocus(st),
                  ]}
                >
                  <Text
                    style={[
                      styles.clueNum,
                      latin(800),
                      s === "correct" && styles.clueDoneText,
                    ]}
                  >
                    {w.clueNumber}
                  </Text>
                  <Text
                    style={[
                      styles.clueZh,
                      s === "correct" && styles.clueDoneText,
                    ]}
                  >
                    {w.wordData.chinese}
                    <Text style={styles.clueEn}> · {w.wordData.english}</Text>
                  </Text>
                  <Text style={styles.clueLen}>
                    {s === "correct" ? "✓" : `${wordCells(w).length} 字母`}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      ))}
    </View>
  );

  const renderClueBar = () => {
    const prev = nextWord(activeWord, -1, false);
    const next = nextWord(activeWord, 1, false);
    return (
      <View style={styles.clueBar}>
        <Pressable
          role="button"
          aria-label="上一个词"
          onPress={() => prev && selectWord(prev)}
          style={(s) => [
            styles.clueArrow,
            s.pressed && styles.clueArrowPressed,
            webFocus(s),
          ]}
        >
          <Text style={styles.clueArrowText}>‹</Text>
        </Pressable>
        <Pressable
          role="button"
          aria-label={
            activeWord
              ? `当前线索：${activeWord.clueNumber}${DIR_NAME[activeWord.direction]}，${clueText(activeWord)}。${wide ? "" : "点按查看全部线索"}`
              : "全部线索"
          }
          onPress={() => !wide && setCluesOpen(true)}
          style={(s) => [styles.clueBarText, webFocus(s)]}
        >
          {activeWord ? (
            <>
              <Text style={[styles.clueBarNum, latin(800)]}>
                {activeWord.clueNumber}
                {DIR_NAME[activeWord.direction]}
              </Text>
              <Text style={styles.clueBarZh} numberOfLines={2}>
                {activeWord.wordData.chinese}
                <Text style={styles.clueBarEn}>
                  {" "}
                  · {activeWord.wordData.english}
                </Text>
              </Text>
            </>
          ) : null}
        </Pressable>
        <Pressable
          role="button"
          aria-label="下一个词"
          onPress={() => next && selectWord(next)}
          style={(s) => [
            styles.clueArrow,
            s.pressed && styles.clueArrowPressed,
            webFocus(s),
          ]}
        >
          <Text style={styles.clueArrowText}>›</Text>
        </Pressable>
        <Pressable
          role="button"
          aria-label="提示当前格子的字母"
          onPress={handleHint}
          style={(s) => [
            styles.hintButton,
            s.pressed && styles.hintPressed,
            webFocus(s),
          ]}
        >
          <Text style={styles.hintText}>提示</Text>
        </Pressable>
      </View>
    );
  };

  const renderKeyboard = () => (
    <View style={styles.keyboard} role="toolbar" aria-label="字母键盘">
      {KEY_ROWS.map((row, i) => (
        <View key={i} style={[styles.keyRow, { gap: keyGap }]}>
          {row.map((letter) => (
            <Pressable
              key={letter}
              role="button"
              aria-label={letter === "Ñ" ? "Ñ，eñe" : letter}
              hitSlop={{ top: 3, bottom: 3, left: 3, right: 3 }}
              onPress={() => handleLetter(letter)}
              style={(s) => [
                styles.key,
                { width: keyWidth },
                s.pressed && styles.keyPressed,
                webFocus(s),
              ]}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={[styles.keyText, latin(700)]}
              >
                {letter}
              </Text>
            </Pressable>
          ))}
          {i === KEY_ROWS.length - 1 && (
            <Pressable
              role="button"
              aria-label="删除"
              hitSlop={{ top: 3, bottom: 3, left: 3, right: 3 }}
              onPress={handleDelete}
              style={(s) => [
                styles.key,
                styles.deleteKey,
                { width: Math.round(keyWidth * 1.5) + keyGap },
                s.pressed && styles.keyPressed,
                webFocus(s),
              ]}
            >
              <Text style={styles.deleteText}>⌫</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );

  const elapsed = session.endTime
    ? Math.round((session.endTime - session.startTime) / 1000)
    : 0;

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <LiveRegion />
      <View style={styles.topBar}>
        <Pressable
          role="button"
          aria-label="返回主页"
          onPress={requestExit}
          style={(s) => [
            styles.iconButton,
            s.pressed && styles.iconPressed,
            webFocus(s),
          ]}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View
          style={styles.progress}
          role="progressbar"
          aria-label={`已完成 ${doneCount} / ${words.length} 个词`}
          aria-valuemin={0}
          aria-valuemax={words.length}
          aria-valuenow={doneCount}
        >
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${words.length ? (doneCount / words.length) * 100 : 0}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, latin(700)]}>
            {doneCount} / {words.length}
          </Text>
        </View>
        <Pressable
          role="button"
          aria-label="玩法说明"
          onPress={() => setHelpOpen(true)}
          style={(s) => [
            styles.iconButton,
            s.pressed && styles.iconPressed,
            webFocus(s),
          ]}
        >
          <Text style={styles.helpText}>?</Text>
        </Pressable>
      </View>

      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={[styles.playColumn, wide && styles.playColumnWide]}>
          {renderGrid()}
          <View style={styles.trayWrap}>
            {/* 例句卡片浮在托盘上方，不挤占网格的高度 */}
            <View style={styles.exampleSlot} pointerEvents="box-none">
              <ExampleCard word={example} onClose={() => setExample(null)} />
            </View>
            <View style={styles.tray}>
              {renderClueBar()}
              {renderKeyboard()}
            </View>
          </View>
        </View>
        {wide && (
          <ScrollView
            style={styles.sidePanel}
            contentContainerStyle={styles.sidePanelContent}
          >
            {renderClueList()}
          </ScrollView>
        )}
      </View>

      <Sheet
        visible={cluesOpen}
        title="全部线索"
        onClose={() => setCluesOpen(false)}
      >
        {renderClueList()}
      </Sheet>
      <Sheet
        visible={helpOpen}
        title="怎么玩"
        onClose={() => setHelpOpen(false)}
      >
        <HowToPlay />
      </Sheet>

      <Dialog
        visible={confirmExit}
        title="退出这一局？"
        message="已经填的字母不会保存。"
        onRequestClose={() => setConfirmExit(false)}
        actions={[
          {
            label: "继续填",
            variant: "primary",
            onPress: () => setConfirmExit(false),
          },
          { label: "退出", variant: "secondary", onPress: goHome },
        ]}
      />

      <Sheet
        visible={session.isCompleted}
        title="¡Muy bien! 完成了"
        onClose={goHome}
        footer={
          <>
            <Button label="再来一局" variant="primary" onPress={playAgain} />
            <Button label="返回主页" variant="secondary" onPress={goHome} />
          </>
        }
      >
        <View style={styles.resultStats}>
          <ResultStat value={formatTime(elapsed)} label="用时" />
          <ResultStat value={`${session.accuracy ?? 0}%`} label="正确率" />
          <ResultStat value={String(session.hintsUsed)} label="提示" />
        </View>
        <Text style={styles.resultScore}>
          得分 <Text style={latin(800)}>{session.score ?? 0}</Text>
        </Text>
        <Text role="heading" style={styles.resultHeading}>
          本局单词
        </Text>
        {words.map((w) => {
          const review =
            session.wrongWordIds.includes(w.id) ||
            session.hintedWordIds.includes(w.id);
          return (
            <View key={w.id} style={styles.resultItem}>
              <View style={styles.resultRow}>
                <Text
                  style={[styles.resultEs, latin(800)]}
                  accessibilityLanguage="es-ES"
                >
                  {w.wordData.spanish}
                </Text>
                <Text style={styles.resultZh}>
                  {w.wordData.chinese}
                  <Text style={styles.clueEn}> · {w.wordData.english}</Text>
                </Text>
                <Text
                  style={[
                    styles.resultTag,
                    review ? styles.resultReview : styles.resultOk,
                  ]}
                >
                  {review ? "需复习" : "✓ 掌握"}
                </Text>
              </View>
              <ExampleSentence word={w.wordData} compact />
            </View>
          );
        })}
      </Sheet>
    </SafeAreaView>
  );
};

const ResultStat: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <View style={styles.resultStat} aria-label={`${label} ${value}`}>
    <Text style={[styles.resultStatValue, latin(800)]}>{value}</Text>
    <Text style={styles.resultStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: space.lg,
    padding: space.xl,
  },
  emptyText: { ...type.heading, color: colors.inkMuted },

  topBar: {
    height: 56,
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.sm,
    gap: space.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPressed: { backgroundColor: colors.surfaceAlt },
  backText: { fontSize: 32, lineHeight: 34, color: colors.ink, marginTop: -4 },
  helpText: { fontSize: 18, fontWeight: "700", color: colors.inkMuted },
  progress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 14,
    color: colors.inkMuted,
    minWidth: 36,
    textAlign: "right",
  },

  body: { flex: 1 },
  bodyWide: {
    flexDirection: "row",
    justifyContent: "center",
    gap: space.xl,
    paddingHorizontal: space.xl,
    paddingBottom: space.lg,
  },
  playColumn: { flex: 1 },
  playColumnWide: { maxWidth: 560 },
  gridArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: space.sm,
  },
  row: { flexDirection: "row" },
  board: {
    padding: BOARD_PAD,
    borderRadius: radius.lg,
    backgroundColor: colors.board,
    borderBottomWidth: 4,
    borderBottomColor: colors.boardEdge,
  },
  blocked: { backgroundColor: colors.boardWell },

  tray: {
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
  clueBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.xs,
    marginBottom: space.sm,
    minHeight: 52,
  },
  clueArrow: {
    width: 40,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  clueArrowPressed: { backgroundColor: colors.border },
  clueArrowText: { fontSize: 28, lineHeight: 30, color: colors.inkMuted },
  clueBarText: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  clueBarNum: { fontSize: 15, color: colors.primary },
  clueBarZh: { flex: 1, fontSize: 17, fontWeight: "700", color: colors.ink },
  clueBarEn: { fontSize: 13, fontWeight: "400", color: colors.inkMuted },
  hintButton: {
    marginLeft: space.xs,
    marginRight: space.xs,
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  hintPressed: { backgroundColor: colors.primarySoft },
  hintText: { fontSize: 15, fontWeight: "700", color: colors.primary },

  keyboard: { alignItems: "center", paddingHorizontal: space.sm, gap: 8 },
  keyRow: { flexDirection: "row" },
  key: {
    height: 46,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 3,
    borderBottomColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  keyPressed: {
    backgroundColor: colors.primarySoft,
    borderBottomWidth: 1,
    transform: [{ translateY: 2 }],
  },
  keyText: { fontSize: 20, color: colors.ink },
  deleteKey: { backgroundColor: "#E9DCC7" },
  deleteText: { fontSize: 20, color: colors.ink },

  sidePanel: { width: 320, flexGrow: 0 },
  sidePanelContent: { paddingVertical: space.lg },
  clueList: { gap: space.lg },
  clueGroup: { gap: space.xs },
  clueGroupTitle: {
    ...type.caption,
    color: colors.inkMuted,
    letterSpacing: 1,
    marginBottom: space.xs,
  },
  clueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  clueItemActive: {
    backgroundColor: colors.tileActiveWord,
    borderLeftColor: colors.primary,
  },
  clueItemPressed: { backgroundColor: colors.surfaceAlt },
  clueNum: { fontSize: 15, color: colors.primary, width: 22 },
  clueZh: { flex: 1, ...type.body, fontWeight: "600", color: colors.ink },
  clueEn: { fontWeight: "400", color: colors.inkMuted },
  clueLen: { ...type.caption, color: colors.inkMuted },
  clueDoneText: { color: colors.success },

  resultStats: { flexDirection: "row", gap: space.sm, marginTop: space.xs },
  resultStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultStatValue: { fontSize: 24, color: colors.ink },
  resultStatLabel: { ...type.caption, color: colors.inkMuted, marginTop: 2 },
  resultScore: {
    ...type.body,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: space.md,
  },
  resultHeading: {
    ...type.caption,
    color: colors.inkMuted,
    letterSpacing: 1,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  trayWrap: { position: "relative" },
  exampleSlot: { position: "absolute", left: 0, right: 0, bottom: "100%" },
  resultItem: {
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  resultEs: { fontSize: 17, color: colors.ink, minWidth: 92 },
  resultZh: { flex: 1, ...type.body, color: colors.ink },
  resultTag: {
    ...type.caption,
    fontWeight: "700",
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  resultOk: {
    color: colors.onSuccessSoft,
    backgroundColor: colors.successSoft,
  },
  resultReview: { color: colors.warning, backgroundColor: colors.warningSoft },
});
