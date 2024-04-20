import React, { useState } from 'react';
import { StyleSheet, View, Text, Button, FlatList, TouchableOpacity, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

// Define the relative date function outside to use in HomeScreen
const getRelativeDueDate = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // Normalize today to start of day for comparison
  const due = new Date(dueDate);

  const timeDiff = due - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  let color = 'green'; // Default color for dates far in the future
  if (daysDiff < 0) {
    color = 'red'; // Overdue tasks
    return { text: `Due ${-daysDiff} days ago`, color };
  } else if (daysDiff === 0) {
    color = 'red'; // Due today
    return { text: 'Today', color };
  } else if (daysDiff === 1) {
    color = 'orange'; // Due tomorrow
    return { text: 'Tomorrow', color };
  } else if (daysDiff <= 3) {
    color = 'orange'; // Due in three days or less
    return { text: `In ${daysDiff} days`, color };
  }

  return { text: `In ${daysDiff} days`, color }; // Default for more than three days
};

function HomeScreen({ navigation, route }) {
  const [todoList, setTodoList] = useState([]);

  // Function to sort tasks by due date
  const sortTasksByDate = (tasks) => {
    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.newTask) {
        setTodoList(prevTasks => {
          // Sort tasks after adding a new task
          return sortTasksByDate([...prevTasks, route.params.newTask]);
        });
        navigation.setParams({ newTask: null });
      }
    }, [route.params?.newTask])
  );

  const removeTask = id => {
    setTodoList(prevTasks => {
      // Sort tasks after removing a task
      return sortTasksByDate(prevTasks.filter(task => task.id !== id));
    });
  };

  const renderTodoItem = ({ item }) => {
    const { text, color } = getRelativeDueDate(item.dueDate);

    return (
      <TouchableOpacity onPress={() => removeTask(item.id)} style={styles.todoItem}>
        <Text style={styles.taskName}>{item.taskName}</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.taskNotes}>{item.notes}</Text>
          <Text style={[styles.taskDate, { color }]}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>To Do</Text>
      <FlatList
        data={todoList}
        renderItem={renderTodoItem}
        keyExtractor={item => item.id}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddTask')}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}

function AddTaskScreen({ navigation }) {
  const [taskName, setTaskName] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');  // Close the picker on Android after selection
    setDate(currentDate);
  };

  const handleAddTask = () => {
    const newTask = {
      id: Date.now().toString(),
      taskName,
      notes,
      dueDate: date.toISOString().split('T')[0]  // Store date in YYYY-MM-DD format
    };
    navigation.navigate('Home', { newTask });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Task Name"
        value={taskName}
        onChangeText={setTaskName}
      />
      <TextInput
        style={styles.input}
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
      />
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Text>Pick Date: {date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      <Button title="Submit Task" onPress={handleAddTask} />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Task Tracker' }} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Add Task' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  todoItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,  // Space between title and details
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskNotes: {
    fontSize: 16,
    color: 'grey',
    flex: 1,  // Take up most of the space, pushing the date to the end
  },
  taskDate: {
    fontSize: 16,
    // Color is dynamically applied now
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: '#ddd',
    marginBottom: 20,
  },
});
