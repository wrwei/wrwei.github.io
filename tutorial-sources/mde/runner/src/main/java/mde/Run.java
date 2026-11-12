package mde;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.stream.Stream;

import javax.xml.parsers.SAXParserFactory;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EClassifier;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.emfatic.core.EmfaticResource;
import org.eclipse.emf.emfatic.core.EmfaticResourceFactory;
import org.eclipse.epsilon.common.parse.problem.ParseProblem;
import org.eclipse.epsilon.egl.EglTemplateFactoryModuleAdapter;
import org.eclipse.epsilon.egl.EgxModule;
import org.eclipse.epsilon.emc.emf.EmfModel;
import org.eclipse.epsilon.eol.IEolModule;
import org.eclipse.epsilon.eol.EolModule;
import org.eclipse.epsilon.etl.EtlModule;
import org.eclipse.epsilon.evl.EvlModule;
import org.eclipse.epsilon.evl.execute.UnsatisfiedConstraint;
import org.eclipse.epsilon.flexmi.FlexmiResourceFactory;
import org.eclipse.gymnast.runtime.core.parser.ParseContext;
import org.eclipse.gymnast.runtime.core.parser.ParseError;
import org.eclipse.gymnast.runtime.core.parser.ParseMessage;
import org.xml.sax.Attributes;
import org.xml.sax.Locator;
import org.xml.sax.helpers.DefaultHandler;

/**
 * Runs Epsilon examples the way the Epsilon Playground does.
 * Usage: java -jar mde-runner.jar job1.properties [job2.properties ...]
 * Each job writes output.txt and status.txt into its "out" directory.
 */
public class Run {

  public static void main(String[] args) throws Exception {
    if (args.length == 0) {
      System.err.println("Usage: java -jar mde-runner.jar job.properties...");
      System.exit(2);
    }
    Resource.Factory.Registry.INSTANCE.getExtensionToFactoryMap().put("flexmi", new FlexmiResourceFactory());
    Resource.Factory.Registry.INSTANCE.getExtensionToFactoryMap().put("emf", new EmfaticResourceFactory());
    for (String arg : args) {
      Properties job = new Properties();
      try (var in = new InputStreamReader(new FileInputStream(arg), StandardCharsets.UTF_8)) { job.load(in); }
      Path out = Path.of(required(job, "out"));
      Files.createDirectories(out);
      ByteArrayOutputStream console = new ByteArrayOutputStream();
      String status;
      try (PrintStream stream = new PrintStream(console, true, StandardCharsets.UTF_8)) {
        try {
          run(job, stream, out);
          status = "ok";
        } catch (Throwable t) {
          String message = t.getMessage() == null ? t.toString() : t.getMessage();
          stream.println(message.strip());
          status = "error\n" + message.strip();
        }
      }
      Files.writeString(out.resolve("output.txt"), console.toString(StandardCharsets.UTF_8).replace("\r\n", "\n"), StandardCharsets.UTF_8);
      Files.writeString(out.resolve("status.txt"), status + "\n", StandardCharsets.UTF_8);
    }
  }

  static void run(Properties job, PrintStream console, Path out) throws Exception {
    String language = required(job, "language");
    IEolModule module = switch (language) {
      case "eol" -> new EolModule();
      case "evl" -> new EvlModule();
      case "etl" -> new EtlModule();
      case "egl" -> new EglTemplateFactoryModuleAdapter();
      case "egx" -> new EgxModule(out.resolve("gen").toAbsolutePath().toString());
      default -> throw new IllegalArgumentException("Unsupported language: " + language);
    };
    module.getContext().setOutputStream(console);
    module.getContext().setErrorStream(console);
    File program = new File(required(job, "program"));
    module.parse(program);
    if (!module.getParseProblems().isEmpty()) {
      ParseProblem p = module.getParseProblems().get(0);
      throw new IllegalStateException("Parse error in " + program.getName() + " line " + p.getLine() + ": " + p.getReason());
    }
    checkMetamodel(required(job, "emfatic"));
    if (language.equals("etl")) checkMetamodel(required(job, "secondEmfatic"));
    EmfModel source = loadModel(language.equals("etl") ? "Source" : "M", required(job, "flexmi"), required(job, "emfatic"), console);
    module.getContext().getModelRepository().addModel(source);
    EmfModel target = null;
    if (language.equals("etl")) {
      target = new EmfModel();
      target.setName("Target");
      target.setMetamodelFile(new File(required(job, "secondEmfatic")).getAbsolutePath());
      target.setModelFile(out.resolve("target.xmi").toAbsolutePath().toString());
      target.setReadOnLoad(false);
      target.setStoredOnDisposal(false);
      target.load();
      module.getContext().getModelRepository().addModel(target);
    }
    try {
      Object result = module.execute();
      switch (language) {
        case "evl" -> report(((EvlModule) module).getContext().getUnsatisfiedConstraints(), console);
        case "egl" -> console.print(result);
        case "egx" -> printGenerated(out.resolve("gen"), console);
        case "etl" -> ModelPrinter.print(target.getResource().getContents(), console);
        default -> { }
      }
    } finally {
      module.getContext().getModelRepository().dispose();
      module.getContext().dispose();
    }
  }

  /**
   * Emfatic keeps syntax errors in its own parse context rather than in Resource.getErrors(),
   * and they otherwise surface later as a misleading "Failed to locate EPackage".
   */
  static void checkMetamodel(String emfatic) throws Exception {
    File file = new File(emfatic);
    EmfaticResource resource = new EmfaticResource(URI.createFileURI(file.getAbsolutePath()));
    resource.load(null);
    ParseContext parse = resource.getParseContext();
    if (parse != null && parse.hasErrors()) {
      ParseMessage first = Arrays.stream(parse.getMessages()).filter(m -> m instanceof ParseError).findFirst().orElse(parse.getMessages()[0]);
      String message = first.getMessage().replaceAll("\\s*\\n\\s*", " ").strip();
      if (!message.contains(" at line ")) {
        String text = Files.readString(file.toPath(), StandardCharsets.UTF_8);
        long line = text.substring(0, Math.min(first.getOffset(), text.length())).chars().filter(c -> c == '\n').count() + 1;
        message = message + " (line " + line + ")";
      }
      throw new IllegalStateException("Metamodel error in " + file.getName() + ": " + message);
    }
  }

  static EmfModel loadModel(String name, String flexmi, String emfatic, PrintStream console) throws Exception {
    EmfModel model = new EmfModel();
    model.setName(name);
    model.setMetamodelFile(new File(emfatic).getAbsolutePath());
    model.setModelFile(new File(flexmi).getAbsolutePath());
    model.setReadOnLoad(true);
    model.setStoredOnDisposal(false);
    model.load();
    List<Warning> warnings = new ArrayList<>();
    for (Resource.Diagnostic w : model.getResource().getWarnings()) warnings.add(new Warning(w.getLine(), w.getMessage()));
    warnings.addAll(undeclaredAttributes(model, new File(flexmi)));
    warnings.stream()
      .sorted(Comparator.comparingInt(Warning::line).thenComparing(Warning::message))
      .map(w -> "Model warning (line " + w.line() + "): " + w.message())
      .distinct()
      .forEach(console::println);
    return model;
  }

  record Warning(int line, String message) {}

  /**
   * Flexmi drops an XML attribute that matches no feature without a warning, so report every attribute
   * that no class in the metamodel declares. (Fuzzy matches such as nme for name still pass unnoticed.)
   */
  static List<Warning> undeclaredAttributes(EmfModel model, File flexmi) throws Exception {
    String text = Files.readString(flexmi.toPath(), StandardCharsets.UTF_8);
    if (!text.stripLeading().startsWith("<")) return List.of(); // the YAML flavour has no XML attributes
    Set<String> features = new HashSet<>();
    for (EObject root : model.getResource().getContents()) collectFeatures(root.eClass().getEPackage(), features);
    List<Warning> found = new ArrayList<>();
    SAXParserFactory.newInstance().newSAXParser().parse(flexmi, new DefaultHandler() {
      private Locator locator;

      @Override
      public void setDocumentLocator(Locator locator) { this.locator = locator; }

      @Override
      public void startElement(String uri, String localName, String qName, Attributes attributes) {
        for (int i = 0; i < attributes.getLength(); i++) {
          String attribute = attributes.getQName(i);
          if (attribute.startsWith(":") || attribute.startsWith("xmlns") || features.contains(attribute)) continue;
          found.add(new Warning(locator.getLineNumber(), "The metamodel has no feature called '" + attribute + "'"));
        }
      }
    });
    return found;
  }

  static void collectFeatures(EPackage ePackage, Set<String> features) {
    for (EClassifier classifier : ePackage.getEClassifiers()) {
      if (classifier instanceof EClass eClass) for (EStructuralFeature feature : eClass.getEAllStructuralFeatures()) features.add(feature.getName());
    }
    for (EPackage sub : ePackage.getESubpackages()) collectFeatures(sub, features);
  }

  static void report(Collection<UnsatisfiedConstraint> unsatisfied, PrintStream console) {
    if (unsatisfied.isEmpty()) {
      console.println("All constraints are satisfied.");
      return;
    }
    for (UnsatisfiedConstraint c : unsatisfied) {
      console.println((c.getConstraint().isCritique() ? "Warning" : "Error") + " [" + c.getConstraint().getName() + "]: " + c.getMessage());
    }
  }

  static void printGenerated(Path root, PrintStream console) throws Exception {
    if (!Files.exists(root)) return;
    try (Stream<Path> files = Files.walk(root)) {
      for (Path file : files.filter(Files::isRegularFile).sorted(Comparator.comparing(Path::toString)).toList()) {
        console.println("--- " + root.relativize(file).toString().replace('\\', '/') + " ---");
        console.println(Files.readString(file, StandardCharsets.UTF_8).stripTrailing());
      }
    }
  }

  static String required(Properties job, String key) {
    String value = job.getProperty(key);
    if (value == null || value.isBlank()) throw new IllegalArgumentException("Job is missing '" + key + "'");
    return value;
  }
}
