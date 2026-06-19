import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

const { width, height } = Dimensions.get('window');

// "PRONTO ARRIVO" betűi -> melyik kerül be a végső "PRONTIVO"-ba
const LETTERS = [
  { char: 'P', keep: true, targetIndex: 0 },
  { char: 'R', keep: true, targetIndex: 1 },
  { char: 'O', keep: true, targetIndex: 2 },
  { char: 'N', keep: true, targetIndex: 3 },
  { char: 'T', keep: true, targetIndex: 4 },
  { char: 'O', keep: false, targetIndex: -1 },
  { char: 'A', keep: false, targetIndex: -1 },
  { char: 'R', keep: false, targetIndex: -1 },
  { char: 'R', keep: false, targetIndex: -1 },
  { char: 'I', keep: true, targetIndex: 5 },
  { char: 'V', keep: true, targetIndex: 6 },
  { char: 'O', keep: true, targetIndex: 7 },
];

const LETTER_SIZE = 34;
const WORD_WIDTH = LETTERS.length * LETTER_SIZE;
const START_X = (width - WORD_WIDTH) / 2;

const TARGET_WORD_WIDTH = 8 * LETTER_SIZE;
const TARGET_START_X = (width - TARGET_WORD_WIDTH) / 2;
const TARGET_Y = height / 2 - 20;

interface Props {
  onFinish: () => void;
}

function FallingLetter({
  letter,
  index,
  theme,
  onLastFallComplete,
}: {
  letter: typeof LETTERS[0];
  index: number;
  theme: any;
  onLastFallComplete?: () => void;
}) {
  const x = useSharedValue(START_X + index * LETTER_SIZE);
  const y = useSharedValue(height / 2 - 20);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (letter.keep) {
      const targetX = TARGET_START_X + letter.targetIndex * LETTER_SIZE;
      x.value = withDelay(
        600,
        withSpring(targetX, { damping: 14, stiffness: 90 })
      );
      scale.value = withDelay(
        600,
        withSequence(
          withTiming(1.3, { duration: 150 }),
          withSpring(1, { damping: 8 })
        )
      );
    } else {
      const fallDelay = 300 + index * 60;
      y.value = withDelay(
        fallDelay,
        withTiming(height + 100, {
          duration: 900,
          easing: Easing.in(Easing.cubic),
        })
      );
      rotate.value = withDelay(
        fallDelay,
        withTiming((index % 2 === 0 ? 1 : -1) * (180 + Math.random() * 180), {
          duration: 900,
          easing: Easing.in(Easing.cubic),
        })
      );
      opacity.value = withDelay(
        fallDelay + 400,
        withTiming(0, { duration: 500 }, (finished) => {
          if (finished && index === LETTERS.length - 1 && onLastFallComplete) {
            runOnJS(onLastFallComplete)();
          }
        })
      );
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value,
    top: y.value,
    opacity: opacity.value,
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.Text
      style={[
        styles.letter,
        { color: letter.keep ? theme.primary : theme.textSecondary },
        animatedStyle,
      ]}
    >
      {letter.char}
    </Animated.Text>
  );
}

export default function SplashIntro({ onFinish }: Props) {
  const theme = useTheme();
  const [showSubtitle, setShowSubtitle] = useState(false);
  const subtitleOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSubtitle(true);
      subtitleOpacity.value = withTiming(1, { duration: 500 });
    }, 1600);

    const finishTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) runOnJS(onFinish)();
      });
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.flipBoard },
        containerStyle,
      ]}
    >
      {LETTERS.map((letter, i) => (
        <FallingLetter key={i} letter={letter} index={i} theme={theme} />
      ))}
      {showSubtitle && (
        <Animated.Text
          style={[styles.subtitle, { color: theme.textSecondary }, subtitleStyle]}
        >
          hamarosan megérkezel
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontSize: 28,
    fontWeight: 'bold',
    width: LETTER_SIZE,
    textAlign: 'center',
    letterSpacing: 0,
  },
  subtitle: {
    position: 'absolute',
    top: height / 2 + 30,
    width: '100%',
    textAlign: 'center',
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
