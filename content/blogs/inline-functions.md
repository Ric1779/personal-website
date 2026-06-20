---
title: "Programs & Functions at Low Level"
date: 2026-01-04T20:17:00+09:00
slug: InlineFunction
category: InlineFunction
tags:
  - low-level
  - programming
summary:
description:
cover:
  image: "covers/inline_function_2.png"
  alt:
  caption:
  relative: true
showtoc: true
draft: false
---

## Why Programs Felt Like Magic to Me

---

When I was younger, programs felt less like things humans built and more like things that simply existed. You wrote some words into a file, pressed a button, and suddenly the computer did something. A game ran. A window opened. A result appeared. Somewhere in between, something invisible happened, and that “something” was never really explained. I knew, in theory, that a program was “code” and that the computer was “executing” it, but those words never formed a real mental picture. What does executing actually mean? Who is doing the executing? How does a machine made of electricity and circuits follow instructions that resemble English? And perhaps the strangest question of all: where does the program go when it runs? At a surface level, it’s easy to accept vague explanations. The computer “runs the program.” The CPU “processes instructions.” Memory “stores data.” But for a long time, those answers felt more like labels than explanations. They named the parts without showing how they fit together.

The confusion deepened once functions entered the picture. Functions are described as neat, self-contained blocks of logic: you call one, it does its work, and execution continues as if nothing unusual happened. But that raises uncomfortable questions. How does the computer know where to return afterward? What happens if one function calls another, or if a function calls itself? Somewhere deep down, it felt like the machine must be keeping track of context in a way that bordered on intelligence, almost as if it remembered intent: “I’ll go over there for a moment, then come back here.” That kind of behavior feels natural to humans, but for a machine that supposedly just executes one instruction after another, it seems oddly sophisticated. That gap, between the simple story we’re told and the complex behavior we observe, is where the feeling of magic comes from. Not the inspiring kind of magic, but the kind that makes systems feel opaque and unapproachable. You can use them, but you don’t truly understand them.

What eventually dissolved that sense of magic wasn’t learning more syntax or climbing further up the abstraction ladder. It was learning how little the CPU actually does. No planning. No awareness. No memory of intent. Just fetching an instruction, executing it, and moving on. Everything else - functions, calls, data structures, even the idea of “returning” from somewhere - emerges from that simplicity. Understanding how something as mundane as jumping to another address and storing a number on a stack can explain all of this was the moment programs stopped feeling supernatural.

## Program at the Lowest Level

---

At its core, a program is not an idea, a workflow, or a set of intentions. It’s not even _logic_ in the way we usually think about it. **At the lowest level, a program is just data - a long sequence of numbers stored in memory.** Those numbers are interpreted as **instructions**.

A CPU doesn’t see variables, functions, loops, or conditionals. It sees only a stream of encoded commands like _“move this value,” “add these numbers,”_ or _“jump to that address.”_ Each instruction is small, mechanical, and boring on its own. There is no understanding of _why_ the instruction exists or what it contributes to the larger program. The CPU simply executes it because that’s what it’s wired to do. This leads to an important shift in perspective: a program is not something the computer _runs_ in a human sense. It’s something the CPU **steps through**, one instruction at a time.

Internally, the processor follows a simple repetitive cycle. It fetches the next instruction from memory, decodes what that instruction means, executes it, and then moves on. Over and over again, billions of times per second. There is no built-in concept of _“this instruction belongs to a function”_ or _“we are inside a loop.”_ The CPU doesn’t know it is executing a program at all. It only knows the address of the current instruction, and where to go next. If nothing ever interrupted this process, execution would simply move forward in a straight line. The program would run from top to bottom exactly once and then stop. What makes software powerful is that this forward motion can be redirected.

To understand how this works, it helps to think of memory as a massive numbered grid. Every location has an address and stores a value. Some of these values represent instructions. Others represent data such as numbers, text, flags, or internal state. But to the CPU, it is all just memory. Nothing in the hardware says _“this is code”_ or _“this is a variable.”_ What matters is how a value is interpreted at a given moment. When the instruction pointer refers to an address, the value there is treated as an instruction. When another address is accessed, its value may be treated as data. The distinction exists mostly in the minds of programmers and in the structure imposed by compilers. This is where high-level programming languages quietly disappear.

When you write a variable, a loop, a function, or an `if` statement, none of those things exist in the executable file that the CPU actually runs. The compiler translates all of that structure into a flat sequence of low-level instructions and memory accesses. By the time the program reaches the processor, the careful organization you created has been erased and replaced with raw mechanics. Seen this way, execution can feel unsettling at first. The program no longer looks like something a human would write. It looks like a machine-specific script for moving values around and occasionally changing where execution continues.

The ability to change where execution continues is what makes computation interesting. This is known as **control flow**. At the center of this process is a special **register** called the **instruction pointer**. This register stores a single number: the memory address of the next instruction the CPU should execute. Most of the time, execution proceeds in the simplest way possible. The processor fetches the instruction at the current address, executes it, and then advances the instruction pointer to the next instruction in memory. If instructions sit at addresses 1000, 1004, and 1008, execution simply moves forward step by step.

What makes software powerful is the ability to redirect that flow. Instead of always moving forward, the CPU can be told to jump to another address. A jump instruction says, in effect: “Set the instruction pointer to this location in memory instead.” Once that happens, execution immediately continues from the new address. From this single mechanism, most high-level control structures emerge. Loops are just backward jumps. Conditionals are jumps that only happen when a condition is met. A jump into another region of code allows reuse of logic. To the CPU, these are not fundamentally different concepts, they are all just decisions about what address comes next. Once you see this clearly, writing programs stop feeling like logical structures and start feeling like carefully choreographed instruction pointer movements.

This leads to the biggest mental shift. There is no hidden machinery making programs behave nicely. There is no invisible system that understands “functions,” “scopes,” or “returns.” **Every abstraction we rely on must ultimately be built out of sequential execution, memory reads and writes, and jumps.** Nothing more. This also reveals an important limitation of the hardware: the processor does not automatically remember where execution came from. Once it jumps somewhere else, the previous location is forgotten unless the program explicitly saves it. That detail becomes crucial when we begin looking at how functions, function calls, and returns are actually constructed at the machine level.

Once you have that mental model, the questions change. Instead of asking, _“How does the computer understand functions?”_ you start asking, _“How do we fake functions using only jumps and memory?”_ And that’s where things get really interesting.

## Functions Without Magic

---

At a high level, functions are presented as a way to organize code. You give a piece of logic a name, you call it, and execution continues as if that logic were a single instruction. Clean, elegant, and easy to reason about. But at the hardware level, **functions do not exist.** The CPU has no idea what a function is. It does not know about parameters, return values, or call stacks. From its perspective, there is only memory and a pointer telling it where to execute next.

Functions are a convention - a disciplined way of arranging instructions and jumps so that a block of code can be reused without copying it everywhere. Imagine writing a program as one long sequence of instructions. The CPU starts at the top and walks forward. That is easy. Now imagine you want to reuse a piece of logic in two different places. You could duplicate the instructions, but that wastes space and makes maintenance painful. Or you could jump to a shared block of code and then return.

Once execution leaves its original path, the CPU forgets where it came from. If we want a function to behave correctly, we must first record the return address somewhere, then jump to the function, and later jump back using that stored address. Because functions can be called from many places, return addresses cannot be hardcoded. They must be dynamic. They must depend on where the call originated. This is where compilers step in. When a compiler sees a function call, it generates code to store the return address in memory, jump to the function, and later restore execution using that stored value.

> Functions are not atomic. They are built out of memory operations and jumps.

This realization reveals the true cost of abstraction. Function calls have a real performance cost. Nested calls require careful bookkeeping. Reuse is always a tradeoff between clarity and overhead. Functions are engineered mechanisms for reuse, designed to look simple so humans can reason about programs.

## When Functions Disappear: Inlining

---

One way to avoid the complexity of calling and returning is to avoid jumping altogether. Instead of generating code that transfers execution elsewhere, the compiler can copy the body of a function directly into the place where it is called. This technique is known as **function inlining**.

From the CPU’s perspective, nothing special happens. There is no call, no return, and no change in control flow. Execution simply continues forward. The function vanishes. Inlining replaces modular structure with duplication. Each “call” becomes a copy of the function’s instructions. Parameters are substituted, local variables are adjusted, and the abstraction is erased. This is why inlining is often described as compile-time substitution.

<!-- Inlining removes the overhead of storing return addresses and manipulating the stack. It also gives the compiler a wider view of the code, enabling aggressive optimizations such as constant folding, dead code elimination, and instruction reordering. For these reasons, compilers favor inlining whenever it seems beneficial. -->

However, inlining has a physical cost: size. Excessive duplication increases binary size, puts pressure on instruction caches, and can eventually harm performance. Large or recursive functions cannot be inlined reliably. At some point, reuse requires sharing code. When that happens, the compiler must return to outlining.

## Jumping Away and Coming Back: Outlining

---

With outlining, a function exists as a single block of code stored in one place. Every call jumps to that block and later returns. This solves the problem of duplication, but it reintroduces the problem of returning. A naive solution is to store the return address in a fixed memory location. This works only until functions call other functions. As soon as calls are nested, return addresses overwrite each other.

The problem is not storage itself. It is ordering. Multiple return addresses must coexist, and they must be restored in reverse order of creation. The most recent call must return first. This is a **Last-In, First-Out** pattern. It is the defining behavior of a **stack**.

At this point, function calls stop being a control-flow trick and become a data-structure problem. Without a structured way to store return addresses, reliable reuse is impossible.

## The Stack: Memory With Discipline

---

A stack is not special hardware. It is just a region of memory that we agree to use in a disciplined way. Alongside it, we maintain a **stack pointer** that tracks the current top. When a function is called, the return address is pushed onto the stack. When the function finishes, that address is popped off and used to resume execution. This simple mechanism solves the nested call problem automatically. Each function interacts only with the top of the stack. No function needs to know how deep it is or who called it.

<!-- Local simplicity produces global correctness. -->

Because function calls are so common, modern CPUs provide hardware support for stack management. Registers store the stack pointer. Special instructions combine jumping with pushing and popping. These features exist purely to accelerate this pattern.

Over time, the stack becomes more than a place for return addresses. Each call creates a **stack frame** that stores parameters, local variables, and saved register values. This is why recursion works: every call receives its own isolated slice of memory.

The stack is the quiet foundation of almost every program. You rarely see it in high-level code, yet it underlies nearly all execution. It exists because programs leave and return. Because execution has depth. Because memory must mirror that depth. And once you understand that, many of the mysteries of programming dissolve. What looks like magic is usually just careful bookkeeping built on top of very simple rules.

At the lowest level, programs are still just numbers. Execution is still just movement. And structure is still something we build - patiently and deliberately - on top of that.

## Inlining and Outlining: Choosing Wisely

---

After seeing how much machinery function outlining requires, it is tempting to conclude that inlining is always superior. No jumps. No stack manipulation. Fewer instructions. Faster execution. At first glance, it seems obvious. But that conclusion does not hold up for long.

Inlining and outlining solve different problems, and the “better” choice depends on constraints that are often invisible at the source-code level. Inlining works by duplicating code. If a function is small and used in only a few places, this duplication barely matters. But if a function is large and widely used, inlining it everywhere can dramatically increase the size of the executable.

Larger binaries consume more memory, take longer to load, and put pressure on the instruction cache. Once a program grows beyond what fits comfortably in cache, performance can degrade sharply. At that point, the cost of having more code outweighs the savings from avoiding function calls. This is why compilers are cautious. They do not simply ask, “_Is this function fast?_” They ask, “_Is it worth duplicating this code here?_”

Outlining avoids duplication, but it introduces its own costs. Every outlined function call requires saving a return address, jumping to another region of memory, and later returning. Arguments must be passed, results retrieved, and registers preserved. Individually, these operations are small. But inside tight loops or performance-critical paths, they accumulate. When the function being called is very short, the overhead of calling it can exceed the cost of the work it performs. In those cases, outlining is technically correct - but inefficient.

Modern CPUs complicate this tradeoff further through caching. Processors do not fetch instructions directly from main memory every time. They rely on fast, limited caches that store recently used code. Inlining increases code size, which can cause instruction cache misses. Outlining reduces code size, but it may place frequently called functions far from their callers, forcing new cache lines to be loaded during jumps.

As a result, two logically identical programs can behave very differently depending on how their code is laid out in memory. This leads to one of the most unintuitive truths about performance:

> Layout matters as much as logic.

Another important factor is frequency. Not all code runs equally often. Some functions sit on hot paths and execute millions of times per second. Others handle rare conditions and may never run at all. Inlining a tiny hot function can be a major win. Inlining a large, rarely used function is often wasteful.

Conversely, outlining cold code can improve overall performance by keeping hot paths compact and cache-friendly. This is why compilers and performance engineers think in terms of execution frequency, not just correctness.

There are also cases where inlining is impossible. The most obvious example is recursion. When a function can call itself an unknown number of times, the compiler cannot inline it fully. There is no finite amount of code that can represent an unbounded call depth. In such cases, outlining is not just better - it is essential. And once outlining is required, the stack and all its associated machinery return.

Modern compilers navigate these tradeoffs continuously. They evaluate function size, call frequency, optimization levels, target architectures, cache behavior, and even debugging constraints. They use heuristics and profiling data to make decisions that are good on average, not perfect in every case. Languages may offer hints such as `inline` keywords or compiler attributes, but these are suggestions, not commands. The compiler ultimately decides. Inlining and outlining are not about right or wrong. They are about tradeoffs. They illustrate a deeper truth about systems programming:

> There is no free abstraction.

Every convenience carries a cost - whether in memory, execution time, complexity, or flexibility. Understanding this does not mean you should manually optimize everything. It means you gain intuition. Performance stops being mysterious and starts looking like the result of concrete design decisions.

## What This Taught Me About Data Structures

---

Before diving into low-level execution, I used to think of data structures mainly as _abstract tools_: stacks, queues, trees, and graphs that existed mostly in textbooks and competitive programming. They felt like conceptual conveniences - useful, but somewhat detached from “real” computation. Understanding how programs actually execute changed that perspective completely.

The call stack, in particular, stopped being just a diagram in lecture slides. It became a living structure that the CPU constantly manipulates. Every function call is a push. Every return is a pop. Every local variable lives inside a carefully allocated frame. What once looked like an academic idea is, in reality, one of the most heavily used data structures in computing. This realization reframed how I think about abstraction. The same applies elsewhere:

- Heaps are not “just memory” - they are managed forests of blocks.
- Objects are layouts with metadata.
- Closures are packaged environments.
- Recursion is a stack-driven algorithm.

Once you see this, data structures stop being optional design choices. They become the language through which computation expresses itself. This also explains why “choosing the right data structure” matters so much. It is not just about asymptotic complexity. It is about aligning your mental model with how machines actually organize information. Good programmers are not just writing logic. They are shaping memory.

## References

---

1. [_How CPUs Run Functions (Youtube)_](https://www.youtube.com/watch?v=7YyALikxAlU&t=60s)

2. [_The Engineering that Runs the Digital World. How do CPUs Work? (YouTube)_](https://www.youtube.com/watch?v=16zrEPOsIcI&t=1871s)
