import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Add, Delete, Edit, NavigateBefore, NavigateNext } from "@mui/icons-material";

const initialForm = {
  title: "My Dynamic Form",
  pages: [
    {
      id: "page1",
      title: "Page 1",
      questions: [
        {
          id: "q1",
          type: "text",
          label: "What is your name?",
          correctAnswer: "Lakshmanan",
          userAnswer: "",
          required: false,
          allowDifferentAnswer: false,
        },
        {
          id: "q2",
          type: "radio",
          label: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: "4",
          userAnswer: "",
          required: true,
          allowDifferentAnswer: true,
        },
        {
          id: "q3",
          type: "checkbox",
          label: "Select your favorite fruits",
          options: ["Apple", "Banana", "Orange", "Mango"],
          correctAnswer: "Apple,Banana",
          userAnswer: "",
          required: false,
          allowDifferentAnswer: false,
        },
      ],
    },
    {
      id: "page2",
      title: "Page 2",
      questions: [
        {
          id: "q4",
          type: "dropdown",
          label: "Choose your favorite programming language",
          options: ["JavaScript", "Python", "Java", "C++", "Go"],
          correctAnswer: "JavaScript",
          userAnswer: "",
          required: true,
          allowDifferentAnswer: true,
        },
      ],
    },
  ],
};

const DynamicFormGenerator = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(initialForm);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [newOption, setNewOption] = useState("");
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);

  const currentPage = form.pages[currentPageIndex];

  const handleQuestionChange = (pageIndex, questionIndex, field, value) => {
    const updatedForm = { ...form };
    updatedForm.pages[pageIndex].questions[questionIndex][field] = value;
    setForm(updatedForm);
  };

  const handleAddOption = (pageIndex, questionIndex) => {
    if (!newOption.trim()) return;
    const updatedForm = { ...form };
    updatedForm.pages[pageIndex].questions[questionIndex].options.push(newOption);
    setForm(updatedForm);
    setNewOption("");
  };

  const handleRemoveOption = (pageIndex, questionIndex, optionIndex) => {
    const updatedForm = { ...form };
    updatedForm.pages[pageIndex].questions[questionIndex].options.splice(optionIndex, 1);
    setForm(updatedForm);
  };

  const handleAddQuestion = () => {
    setEditingQuestion({
      id: `q${Date.now()}`,
      type: "text",
      label: "",
      correctAnswer: "",
      userAnswer: "",
      options: [],
      required: false,
      allowDifferentAnswer: false,
    });
    setIsQuestionDialogOpen(true);
  };

  const handleSaveQuestion = () => {
    const updatedForm = { ...form };
    if (editingQuestion.index !== undefined) {
      // Editing existing question
      updatedForm.pages[currentPageIndex].questions[editingQuestion.index] = editingQuestion;
    } else {
      // Adding new question
      updatedForm.pages[currentPageIndex].questions.push(editingQuestion);
    }
    setForm(updatedForm);
    setIsQuestionDialogOpen(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (questionIndex) => {
    setEditingQuestion({
      ...currentPage.questions[questionIndex],
      index: questionIndex,
    });
    setIsQuestionDialogOpen(true);
  };

  const handleRemoveQuestion = (questionIndex) => {
    const updatedForm = { ...form };
    updatedForm.pages[currentPageIndex].questions.splice(questionIndex, 1);
    setForm(updatedForm);
  };

  const handleAddPage = () => {
    setEditingPage({
      id: `page${Date.now()}`,
      title: `Page ${form.pages.length + 1}`,
      questions: [],
    });
    setIsPageDialogOpen(true);
  };

  const handleSavePage = () => {
    const updatedForm = { ...form };
    if (editingPage.index !== undefined) {
      updatedForm.pages[editingPage.index] = editingPage;
    } else {
      updatedForm.pages.push(editingPage);
    }
    setForm(updatedForm);
    setIsPageDialogOpen(false);
    setEditingPage(null);
  };

  const handleEditPage = (pageIndex) => {
    setEditingPage({
      ...form.pages[pageIndex],
      index: pageIndex,
    });
    setIsPageDialogOpen(true);
  };

  const handleRemovePage = (pageIndex) => {
    if (form.pages.length <= 1) return;
    const updatedForm = { ...form };
    updatedForm.pages.splice(pageIndex, 1);
    setForm(updatedForm);
    if (currentPageIndex >= pageIndex) {
      setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
    }
  };

  const handlePreviousPage = () => {
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPageIndex((prev) => Math.min(form.pages.length - 1, prev + 1));
  };

  const handleCheckboxChange = (pageIndex, questionIndex, option, isChecked) => {
    const updatedForm = { ...form };
    const question = updatedForm.pages[pageIndex].questions[questionIndex];
    let currentAnswers = question.userAnswer ? question.userAnswer.split(',') : [];
    
    if (isChecked) {
      currentAnswers.push(option);
    } else {
      currentAnswers = currentAnswers.filter(item => item !== option);
    }
    
    question.userAnswer = currentAnswers.join(',');
    setForm(updatedForm);
  };

  const renderQuestionInput = (pageIndex, question, questionIndex) => {
    switch (question.type) {
      case "text":
        return <></>;
      case "radio":
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={question.userAnswer}
              onChange={(e) =>
                handleQuestionChange(pageIndex, questionIndex, "userAnswer", e.target.value)
              }
            >
              {question.options.map((option, optionIndex) => (
                <Box key={optionIndex} display="flex" alignItems="center">
                  <FormControlLabel value={option} control={<Radio />} label={option} />
                  <IconButton
                    onClick={() => handleRemoveOption(pageIndex, questionIndex, optionIndex)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Box display="flex" alignItems="center" mt={1}>
                <TextField
                  size="small"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="New option"
                />
                <IconButton onClick={() => handleAddOption(pageIndex, questionIndex)}>
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </RadioGroup>
          </FormControl>
        );
      case "dropdown":
        return (
          <FormControl fullWidth>
            <InputLabel>Select an option</InputLabel>
            <Select
              value={question.userAnswer}
              onChange={(e) =>
                handleQuestionChange(pageIndex, questionIndex, "userAnswer", e.target.value)
              }
              label="Select an option"
            >
              {question.options.map((option, optionIndex) => (
                <MenuItem key={optionIndex} value={option}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    {option}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(pageIndex, questionIndex, optionIndex);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <Box display="flex" alignItems="center" mt={1}>
              <TextField
                fullWidth
                size="small"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="New option"
              />
              <IconButton onClick={() => handleAddOption(pageIndex, questionIndex)}>
                <Add fontSize="small" />
              </IconButton>
            </Box>
          </FormControl>
        );
      case "checkbox":
        return (
          <FormControl component="fieldset" fullWidth>
            {question.options.map((option, optionIndex) => (
              <Box key={optionIndex} display="flex" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={question.userAnswer.includes(option)}
                      onChange={(e) =>
                        handleCheckboxChange(pageIndex, questionIndex, option, e.target.checked)
                      }
                    />
                  }
                  label={option}
                />
                <IconButton
                  onClick={() => handleRemoveOption(pageIndex, questionIndex, optionIndex)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Box display="flex" alignItems="center" mt={1}>
              <TextField
                size="small"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="New option"
              />
              <IconButton onClick={() => handleAddOption(pageIndex, questionIndex)}>
                <Add fontSize="small" />
              </IconButton>
            </Box>
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Box p={4}>
        <TextField
          style={{ marginBottom: "20px" }}
          variant="outlined"
          fullWidth
          label="Form Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            variant="contained"
            endIcon={<NavigateNext />}
            onClick={() => {
              navigate('/preview', { state: { form } }); 
            }}
          >
            Preview
          </Button>
        </Box>

        <Typography textAlign={"center"} variant="h6" px={2} pb={2}>
          {currentPage.title} (Page {currentPageIndex + 1} of {form.pages.length})
        </Typography>

        <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">{currentPage.title}</Typography>
            <Box>
              <IconButton onClick={() => handleEditPage(currentPageIndex)}>
                <Edit />
              </IconButton>
              <IconButton
                onClick={() => handleRemovePage(currentPageIndex)}
                disabled={form.pages.length <= 1}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          {currentPage.questions.map((question, questionIndex) => (
            <Box key={question.id} mb={4} p={2} border={1} borderColor="divider" borderRadius={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1">
                  {question.label} 
                  {question.required && <span style={{ color: 'red', marginLeft: '5px' }}>*</span>}
                </Typography>
                <Box>
                  <IconButton onClick={() => handleEditQuestion(questionIndex)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleRemoveQuestion(questionIndex)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              {renderQuestionInput(currentPageIndex, question, questionIndex)}
              <Box mt={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Correct Answer"
                  value={question.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(
                      currentPageIndex,
                      questionIndex,
                      "correctAnswer",
                      e.target.value
                    )
                  }
                  helperText={question.type === 'checkbox' ? "Enter comma-separated values" : ""}
                />
              </Box>
              <Box mt={2} display="flex" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={question.required}
                      onChange={(e) =>
                        handleQuestionChange(
                          currentPageIndex,
                          questionIndex,
                          "required",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Required"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={question.allowDifferentAnswer}
                      onChange={(e) =>
                        handleQuestionChange(
                          currentPageIndex,
                          questionIndex,
                          "allowDifferentAnswer",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Allow Different Answer"
                />
              </Box>
            </Box>
          ))}

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button variant="contained" color="primary" onClick={handleAddQuestion}>
              Add Question
            </Button>
            <Button variant="outlined" color="primary" onClick={handleAddPage}>
              Add Page
            </Button>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button
              variant="outlined"
              startIcon={<NavigateBefore />}
              onClick={handlePreviousPage}
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
        </Paper>

        <Dialog open={isQuestionDialogOpen} onClose={() => setIsQuestionDialogOpen(false)}>
          <DialogTitle>
            {editingQuestion?.index !== undefined ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <Divider />
          <DialogContent>
            {editingQuestion && (
              <Box mt={2}>
                <TextField
                  fullWidth
                  label="Question Label"
                  value={editingQuestion.label}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, label: e.target.value })
                  }
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={editingQuestion.type}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, type: e.target.value })
                    }
                    label="Question Type"
                  >
                    <MenuItem value="text">Text Input</MenuItem>
                    <MenuItem value="radio">Radio Buttons</MenuItem>
                    <MenuItem value="dropdown">Dropdown</MenuItem>
                    <MenuItem value="checkbox">Checkbox</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Correct Answer"
                  value={editingQuestion.correctAnswer}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })
                  }
                  margin="normal"
                  helperText={editingQuestion.type === 'checkbox' ? "Enter comma-separated values" : ""}
                />
                <Box mt={2} display="flex" justifyContent="space-between">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingQuestion.required}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, required: e.target.checked })
                        }
                      />
                    }
                    label="Required"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingQuestion.allowDifferentAnswer}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, allowDifferentAnswer: e.target.checked })
                        }
                      />
                    }
                    label="Allow Different Answer"
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={() => setIsQuestionDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveQuestion} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isPageDialogOpen} onClose={() => setIsPageDialogOpen(false)}>
          <DialogTitle>
            {editingPage?.index !== undefined ? "Edit Page" : "Add New Page"}
          </DialogTitle>
          <Divider />
          <DialogContent>
            {editingPage && (
              <Box>
                <TextField
                  fullWidth
                  label="Page Title"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  margin="normal"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="outlined" onClick={() => setIsPageDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSavePage}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default DynamicFormGenerator;