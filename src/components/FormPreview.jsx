import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  RadioGroup,
  Radio,
  TextField,
  Typography,
  Select,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const FormPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const form = location.state?.form;

  if (!form) navigate("/");

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState({});

  const currentPage = form.pages[currentPageIndex];

  const handleAnswerChange = (questionId, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error when user answers
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateCurrentPage = () => {
    const newErrors = {};
    let isValid = true;

    currentPage.questions.forEach((question) => {
      if (question.required && !userAnswers[question.id]) {
        newErrors[question.id] = "This question is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNextPage = () => {
    if (validateCurrentPage()) {
      setCurrentPageIndex((prev) => Math.min(form.pages.length - 1, prev + 1));
    }
  };

  const calculateScore = () => {
    if (!validateCurrentPage()) return;

    let correct = 0;
    let totalQuestions = 0;

    form.pages.forEach((page) => {
      page.questions.forEach((question) => {
        totalQuestions++;
        const userAnswer = userAnswers[question.id];

        if (question.type === "checkbox") {
          // For checkbox questions, compare sorted arrays
          const correctAnswers = question.correctAnswer.split(",").sort();
          const userSelected = (userAnswer || "").split(",").sort();
          if (JSON.stringify(correctAnswers) === JSON.stringify(userSelected)) {
            correct++;
          }
        } else if (question.allowDifferentAnswer) {
          // For questions that allow different answers, always count as correct if answered
          if (userAnswer) correct++;
        } else {
          // Standard comparison for other questions
          if (userAnswer === question.correctAnswer) {
            correct++;
          }
        }
      });
    });

    setScore(Math.round((correct / totalQuestions) * 100));
    setShowResults(true);
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "text":
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={userAnswers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            error={!!errors[question.id]}
            helperText={errors[question.id]}
          />
        );
      case "radio":
        return (
          <FormControl component="fieldset" error={!!errors[question.id]}>
            <RadioGroup
              value={userAnswers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              {question.options.map((option, index) => (
                <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
            {errors[question.id] && <FormHelperText>{errors[question.id]}</FormHelperText>}
          </FormControl>
        );
      case "dropdown":
        return (
          <FormControl fullWidth error={!!errors[question.id]}>
            <InputLabel>Select an option</InputLabel>
            <Select
              value={userAnswers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              label="Select an option"
            >
              {question.options.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors[question.id] && <FormHelperText>{errors[question.id]}</FormHelperText>}
          </FormControl>
        );
      case "checkbox":
        return (
          <FormControl component="fieldset" fullWidth error={!!errors[question.id]}>
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={(userAnswers[question.id] || "").includes(option)}
                    onChange={(e) => {
                      const currentValues = (userAnswers[question.id] || "")
                        .split(",")
                        .filter(Boolean);
                      let newValues;
                      if (e.target.checked) {
                        newValues = [...currentValues, option];
                      } else {
                        newValues = currentValues.filter((val) => val !== option);
                      }
                      handleAnswerChange(question.id, newValues.join(","));
                    }}
                  />
                }
                label={option}
              />
            ))}
            {errors[question.id] && <FormHelperText>{errors[question.id]}</FormHelperText>}
          </FormControl>
        );
      default:
        return null;
    }
  };

  if (showResults) {
    return (
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Your Results
        </Typography>
        <Typography
          variant="h4"
          fontWeight={700}
          color={score > 70 ? "success.main" : score > 40 ? "warning.main" : "error.main"}
          gutterBottom
        >
          Score: {score}%
        </Typography>

        {form.pages.map((page) => (
          <Box key={page.id} mb={4}>
            <Typography variant="h6" gutterBottom>
              {page.title}
            </Typography>
            {page.questions.map((question) => {
              const isCorrect =
                question.type === "checkbox"
                  ? JSON.stringify((userAnswers[question.id] || "").split(",").sort()) ===
                    JSON.stringify(question.correctAnswer.split(",").sort())
                  : question.allowDifferentAnswer
                  ? !!userAnswers[question.id]
                  : userAnswers[question.id] === question.correctAnswer;

              return (
                <Box
                  key={question.id}
                  mb={3}
                  p={2}
                  border={1}
                  borderColor="divider"
                  borderRadius={2}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {question.label} {question.required && <span style={{ color: "red" }}>*</span>}
                  </Typography>
                  <Typography>Your answer: {userAnswers[question.id] || "Not answered"}</Typography>
                  {!question.allowDifferentAnswer && (
                    <Typography color="text.secondary">
                      Correct answer: {question.correctAnswer}
                    </Typography>
                  )}
                  <Typography color={isCorrect ? "success.main" : "error.main"}>
                    {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    {question.allowDifferentAnswer && " (Different answer allowed)"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}

        <Button
          variant="contained"
          sx={{ marginRight: 1 }}
          color="primary"
          onClick={() => {
            setShowResults(false);
            setCurrentPageIndex(0);
            setErrors({});
          }}
        >
          Try Again
        </Button>
        <Button variant="contained" startIcon={<NavigateBefore />} onClick={() => navigate("/")}>
          Home
        </Button>
      </Box>
    );
  }

  return (
    <Box margin={"0 auto"} p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom>
          {form.title}
        </Typography>
        <Button variant="contained" startIcon={<NavigateBefore />} onClick={() => navigate("/")}>
          Home
        </Button>
      </Box>
      <Typography textAlign="center" variant="h6" p={2}>
        {currentPage.title} (Page {currentPageIndex + 1} of {form.pages.length})
      </Typography>
      <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px" }}>
        <Typography variant="h6" gutterBottom>
          {currentPage.title}
        </Typography>

        {currentPage.questions.map((question) => (
          <Box key={question.id} mb={4}>
            <Typography variant="subtitle1" gutterBottom>
              {question.label}
              {question.required && <span style={{ color: "red", marginLeft: "5px" }}>*</span>}
            </Typography>
            {renderQuestion(question)}
          </Box>
        ))}
      </Paper>

      {currentPageIndex === form.pages.length - 1 && (
        <Box display="flex" justifyContent="end">
          <Button variant="contained" color="primary" size="large" onClick={calculateScore}>
            Submit Answers
          </Button>
        </Box>
      )}

      <Box display="flex" justifyContent="space-between" my={3}>
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentPageIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          endIcon={<NavigateNext />}
          onClick={handleNextPage}
          disabled={currentPageIndex === form.pages.length - 1}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default FormPreview;
