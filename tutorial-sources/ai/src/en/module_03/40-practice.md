## Self-check quiz {#quiz}

Twelve questions, one correct answer each; attempt them without looking back, then read every explanation, including those of the options you rejected, because each wrong option is a mistake people really make.

```quiz
? A 3 × 3 convolution maps 32 input channels to 64 output channels, with a bias per output channel. How many parameters does it have?
- [ ] 18,432
- [ ] 2,048
- [x] 18,496
- [ ] 4,718,592
> The count is $k^2 C_{\text{in}} C_{\text{out}} + C_{\text{out}} = 9 \times 32 \times 64 + 64 = 18{,}496$. The value 18,432 forgets the 64 biases; 2,048 ignores the 3 × 3 spatial extent ($32 \times 64$ is the count of a 1 × 1 convolution); 4,718,592 is the multiply-accumulate count on a 16 × 16 output map ($18{,}432 \times 256$), which depends on the map size, whereas the parameter count does not.

? Input width 64, kernel size 3, dilation 2, padding 1, stride 1. What is the output width?
- [ ] 64
- [ ] 60
- [x] 62
- [ ] 63
> The output width is $\lfloor (64 + 2\cdot 1 - 2\cdot(3-1) - 1)/1 \rfloor + 1 = 62$. The dilated kernel spans $d(k-1) + 1 = 5$ inputs, so "same" padding would need $p = 2$ and would give 64 (as would ignoring the dilation, $64 + 2 - 2 - 1 + 1$); 60 is the unpadded result; 63 ignores the dilation and also drops the final $+1$, $64 + 2 - 2 - 1 = 63$.

? With circular padding, which of these operations is exactly equivariant to a one-pixel circular shift of its input?
- [ ] A 2 × 2 max pool with stride 2
- [ ] A 3 × 3 convolution with stride 2
- [ ] Flattening followed by a dense layer
- [x] A 3 × 3 convolution with stride 1
> A stride-1 convolution commutes with every integer shift. Stride-2 operations (the pool and the strided convolution) are equivariant only to shifts by multiples of 2: a one-pixel shift changes which windows are sampled, which is the source of the aliasing discussed in [Section 5](#s5). A dense layer on a flattened map has a separate weight for every position and no equivariance at all.

? Four 3 × 3 convolutions are stacked. The second has stride 2, the others have stride 1, and none is dilated. What is the receptive field of the last layer's output?
- [ ] 9
- [ ] 11
- [x] 13
- [ ] 17
> The receptive field is 3 after the first layer and 5 after the second; the stride of the second makes the jump 2, so the third and fourth layers each add $(3-1) \times 2 = 4$, giving 9 and then 13. With all strides equal to 1 the answer would be 9 (3, 5, 7, 9); 17 needs the third layer to have stride 2 as well (3, 5, 9, 17); 11 applies the doubled jump to the third layer only and lets the fourth add 2 again (3, 5, 9, 11), forgetting that the jump stays doubled for every later layer.

? A standard 3 × 3 convolution with 256 input and 256 output channels is replaced by a depthwise 3 × 3 convolution followed by a 1 × 1 convolution. By roughly what factor do the multiply-accumulates fall?
- [ ] 2
- [ ] 256
- [x] 8.7
- [ ] Exactly 9
> The cost ratio is $1/C_{\text{out}} + 1/k^2 = 1/256 + 1/9 = 0.115$, a factor of 8.7. It approaches 9 only as $C_{\text{out}}$ grows without bound, so "exactly 9" is wrong for any real layer. A factor of 256 would require the channel mixing to cost nothing, and a factor of 2 would hold only for a layer with very few channels.

? In a network of residual blocks $\mathbf{h}_{l+1} = \mathbf{h}_l + F(\mathbf{h}_l)$, why can the gradient reach the early layers even when the network is very deep?
- [ ] The residual branches are linear, so their Jacobians are identity matrices
- [ ] Batch normalisation rescales the gradient at every block, so it cannot vanish
- [x] Each block's Jacobian is $\mathbf{I} + \partial F/\partial \mathbf{h}$, so the gradient contains a term that passes through every block unchanged
- [ ] Shortcuts reduce the parameter count, so each parameter receives a larger share of the gradient
> Unrolling the recursion gives $\partial \mathcal{L}/\partial \mathbf{h}_l = \partial \mathcal{L}/\partial \mathbf{h}_L\,(\mathbf{I} + \partial/\partial \mathbf{h}_l \sum_i F_i)$: the identity term carries the top gradient to every layer, whatever the branches do. The branches are nonlinear and their Jacobians are not identities. Batch normalisation alone did not rescue the plain network in [Lab 3](#lab3): at 55 layers its stem gradient exploded (about 190) instead of vanishing. The parameter count plays no part.

? You freeze a pretrained backbone with `requires_grad=False`, train a new head with the whole model in `train()` mode, and find that the backbone's outputs have drifted. What is the cause?
- [ ] The optimiser still applies weight decay to the frozen weights
- [ ] The learning-rate schedule re-initialises the backbone
- [ ] Dropout masks are stored in the weights
- [x] Batch-norm running means and variances are updated in train mode regardless of `requires_grad`
> `requires_grad=False` stops gradient updates, but a batch-norm layer in train mode overwrites its running statistics with those of your batches, which changes its evaluation-mode output. Put the frozen blocks back in `eval()` mode after every call to `model.train()`. PyTorch's optimisers skip parameters that have no gradient (and frozen parameters are usually not passed to them), dropout keeps no state in the weights, and schedules change learning rates, not weights.

? Two 10 × 10 boxes overlap, one offset from the other by 5 pixels in $x$ and 5 in $y$. What is their IoU?
- [ ] 0.25
- [ ] 0.5
- [x] 0.143
- [ ] 0.125
> The intersection is $5 \times 5 = 25$, the union is $100 + 100 - 25 = 175$, and the IoU is $25/175 = 0.143$. The value 0.25 divides the intersection by one box's area instead of the union; 0.5 is the fraction of each side that overlaps; 0.125 divides by $200$, the sum of the areas, forgetting to subtract the intersection once.

? What does non-maximum suppression do?
- [ ] Removes every box whose score is below the highest score of its class
- [ ] Suppresses activations below the maximum in each pooling window
- [ ] Averages overlapping boxes into a single box
- [x] Repeatedly keeps the highest-scoring box and deletes the other boxes of the same class that overlap it above an IoU threshold
> NMS is greedy de-duplication, run per class. The first option would delete every other object of the class, however far away; the second describes max pooling; averaging overlapping boxes is a different method (weighted box fusion) with different failure modes. NMS's own failure is the opposite one: of two real objects that overlap above the threshold, the lower-scoring one is deleted, which Soft-NMS softens.

? Why does U-Net concatenate encoder feature maps into its decoder?
- [ ] To reduce the decoder's parameter count
- [ ] To make every block residual so that the network trains at depth
- [ ] To let the network accept inputs of any size
- [x] To give the decoder high-resolution features so that object boundaries can be placed precisely
> The bottleneck has lost spatial detail, and the skips bring it back at each resolution. In [Lab 5](#lab5) they raised pixel accuracy within 2 pixels of the true edge from 0.920 to 0.950, while overall Dice moved only from 0.952 to 0.965. Concatenation adds decoder parameters (the input channels double); it is not a residual sum; and it makes the size constraint stricter, not looser, because the two maps must have matching height and width.

? In a dataset where 0.6% of the pixels are foreground, a model predicts background everywhere. What are its pixel accuracy and its Dice coefficient?
- [ ] 0.6% and 0
- [ ] 99.4% and 0.994
- [x] 99.4% and 0
- [ ] 50% and 0.5
> Accuracy counts the 99.4% of pixels that are background and correctly labelled. Dice is $2TP/(2TP + FP + FN)$, which is 0 when $TP = 0$. This is why segmentation is reported with Dice or IoU for the foreground class: pixel accuracy rewards the majority class. The first option gives the foreground share as the accuracy, the second takes the Dice coefficient to equal the accuracy, and 50% would describe a model that guesses.

? In Grad-CAM, the weight $\alpha_k^c$ of feature map $k$ for class $c$ is:
- [ ] The maximum activation of map $k$
- [ ] The gradient of $y^c$ with respect to the input pixels
- [x] The spatial average of $\partial y^c/\partial A^k_{ij}$ over the map's positions
- [ ] Always equal to the classifier weight $w_k^c$
> By definition $\alpha_k^c = \frac{1}{Z}\sum_{i,j} \partial y^c/\partial A^k_{ij}$. It equals $w_k^c/Z$, not $w_k^c$, only for a global-average-pooling and linear head, which is the CAM case; the gradient with respect to the input pixels is the saliency map, a different object; the maximum activation does not involve the class at all.
```

## Guided reading {#reading}

A paper is read in two passes, not one. The first pass takes five minutes and is not reading in the usual sense: you read the title, the abstract and the introduction, the section headings, the figures with their captions, and the conclusion. Then you write one sentence saying what the authors claim, and decide whether the claim matters to you. Most papers stop there. The second pass is the one the time estimates below describe. You read the parts the guide names, with a pen, and you do the work the paper asks you to take on trust: reproduce one derivation, check one number in a table against what the text says, and note every assumption the argument needs. The reading questions are the second pass in miniature. Read them before the paper, so that the paper answers them as you go. A third pass, reimplementing the method, is what the labs of this module did for convolution, the residual network and the U-Net. Keshav's "How to read a paper" (in the references) describes the habit in three pages.

The two papers cover the module's arc: the paper that made depth trainable ([Section 8](#s8)) and the paper that set the pattern for segmentation ([Section 12](#s12)). Together they take 45 minutes. Section and figure numbers below refer to the conference versions; arXiv versions of the same papers may differ slightly, so use the headings if the numbers do not match.

::: paper minutes=25
He, K., Zhang, X., Ren, S., Sun, J. "Deep residual learning for image recognition." *IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 2016.

**Why read it.** It is the paper that made depth trainable. It argues from one experiment, the degradation problem, to one idea, the residual connection, and backs the idea with clean ablations. Its block, $\mathbf{x} + F(\mathbf{x})$, reappears in every transformer. Its operation counts are multiply-adds, the convention that later vision papers inherited ([Section 4](#s4)).

**What to read.** Read Section 1 with Figure 1. Read Sections 3.1 to 3.3 (residual learning, identity shortcuts, and the architectures of Figure 3 and Table 1). In Section 4.1, read the plain-versus-residual comparison (Figure 4 and Table 2), the shortcut options A, B and C (Table 3) and the bottleneck design (Figure 5). Read Section 4.2 on CIFAR-10 (Figure 6 and Table 6). Skim the remaining ImageNet comparison tables. Skip Section 2 (related work), the object-detection results of Section 4.3 and, in the arXiv version, the appendix on detection and localisation.

**Questions to answer while reading.**

1. Figure 1 shows a 56-layer plain network with higher training error than a 20-layer one. Why does that rule out overfitting, and what argument in Section 1 says that a deeper model should do at least as well as a shallower one?
2. The paper states its operation counts as FLOPs, and Table 1 lists $1.8 \times 10^9$ for ResNet-18. Count ResNet-18's multiply-accumulates at 224 × 224 yourself from its layer list ([Section 4](#s4) gives 1.81 G) and decide which convention the paper uses. Why does it matter when you compare with a paper that counts multiplies and additions separately?
3. What are shortcut options A, B and C (Table 3), how much do they differ in error, and why do the authors conclude that projection shortcuts are not essential?
4. Count the weights of the bottleneck block of Figure 5 (right) for 256 channels, ignoring biases and batch-norm parameters, and compare with two 3 × 3 convolutions at 256 channels. (Answer: 69,632 against 1,179,648.)
5. On CIFAR-10 the 1,202-layer network reaches a training error similar to the 110-layer one but a higher test error (7.93% against 6.43%). What explains it, and how does that differ from the degradation problem?

**After reading.** Write the residual block of [Section 8](#s8) from memory as a PyTorch module, with the projection shortcut for a change of width, and check it against the paper's Figure 5 (left) and Equation 2. Then state in two sentences what [Lab 3](#lab3) reproduced of the paper's claim and what it could not, at 55 layers on 8 × 8 digits instead of 56 layers on CIFAR-10.
:::

::: paper minutes=20
Ronneberger, O., Fischer, P., Brox, T. "U-Net: Convolutional networks for biomedical image segmentation." *Medical Image Computing and Computer-Assisted Intervention (MICCAI)*, 2015.

**Why read it.** It is a short paper that set the standard architecture for biomedical segmentation. With the output-size formula of [Section 3](#s3) in hand, every number in its Figure 1 can be checked, and the paper is frank about working from very few annotated images.

**What to read.** Read Sections 1 to 3 in full, with Figures 1 to 3 (the architecture, the overlap-tile strategy, and the weight map for touching cells), including the data-augmentation subsection (3.1). Skim Section 4 for the number of training images and the metrics used. Skip the details of the comparison tables.

**Questions to answer while reading.**

1. Trace the feature-map sizes of Figure 1 from 572 × 572 to 388 × 388 with the output-size formula. How many pixels must be cropped from each side of the first encoder map before concatenation? (568 to 392: 88.)
2. What problem does the overlap-tile strategy (Figure 2) solve, and why do the authors mirror the image at its borders?
3. What is the weight map $w(\mathbf{x})$ of Equation 2 for, and which failure of plain per-pixel cross-entropy does it address?
4. Which augmentation do the authors single out as key when only a few annotated images are available, and why does it suit microscopy?
5. The paper's convolutions are unpadded. What would change in the architecture and in tiled inference if they were padded?

**After reading.** Compare the paper's architecture with the U-Net of [Lab 5](#lab5): list three differences (padding, depth and width, loss) and say what each costs or buys. Then check the claim of [Section 12](#s12) that skips matter more for boundary accuracy than for overall Dice against what Lab 5 measured, and decide whether the paper's own evidence could distinguish the two.
:::

## Summary {#summary}

- Flattening an image into a vector discards its neighbourhood structure and costs a dense layer a weight for every pixel pair; convolution restores both by local connectivity and weight sharing, so a 3 × 3 layer has $9 C_{\text{in}} C_{\text{out}} + C_{\text{out}}$ parameters whatever the image size, and its response is equivariant to translation.
- What deep-learning libraries call convolution is cross-correlation: the kernel is not flipped. The output size is $\lfloor (H + 2p - d(k-1) - 1)/s \rfloor + 1$, and the receptive field grows at each layer by $(k-1)$ times the current jump, the jump being multiplied by each stride; the effective receptive field is smaller than the theoretical one.
- A layer's cost is counted in parameters, multiply-accumulates (MACs) and activation memory: the 3 × 3, 64 to 128 layer on a 56 × 56 map has 73,856 parameters and 231 million MACs, which is 462.4 MFLOPs without bias additions, with FLOPs equal to twice the MACs. The "FLOPs" of the ResNet, EfficientNet and ConvNeXt papers, and MobileNet's "Mult-Adds", are MACs. Cheaper layers split the work: a 1 × 1 convolution mixes channels at one position, grouped convolutions split the channels into independent groups, and a depthwise-separable convolution (depthwise 3 × 3, then 1 × 1) costs $1/C_{\text{out}} + 1/k^2$ of a standard one, about 8.7 times fewer MACs at 256 channels, at the price of lower arithmetic intensity on real hardware.
- Pooling and strides trade resolution for receptive field and some invariance, but strided operations are equivariant only to shifts that are multiples of the stride, so networks are less shift-invariant than their design suggests; anti-aliased downsampling restores part of it.
- The classic architectures each contributed one idea: LeNet the convolution-pool-dense pattern, AlexNet ReLU, dropout and GPU training at scale (ILSVRC-2012 top-5 error of 15.3% against 26.2% for the next entry), VGG depth through uniform 3 × 3 stacks, and Inception multi-scale branches with 1 × 1 reductions and global average pooling in place of large dense layers.
- A plain network beyond a certain depth trains worse than a shallower one, even on its training set (the degradation problem). A residual block $\mathbf{h}_{l+1} = \mathbf{h}_l + F(\mathbf{h}_l)$ has Jacobian $\mathbf{I} + \partial F/\partial \mathbf{h}$, so the gradient contains a term that reaches every layer unchanged; in Lab 3 the plain 55-layer stem gradient underflowed to 0 without normalisation and exploded with it, while the residual network's stayed between 0.02 and 0.09 at every depth.
- Later CNNs refined the recipe rather than replacing it: DenseNet concatenates features, MobileNet and EfficientNet spend parameters and compute efficiently through separable convolutions and compound scaling, and ConvNeXt showed that much of the gap to vision transformers came from the training recipe and design details, not from attention; as of 2026 CNNs and transformers coexist, and the choice rests on data, latency and hardware.
- Training a CNN well is mostly decisions around the architecture: label-preserving augmentation (which can hurt when it breaks the task's symmetry, as shift-and-rotate did on centred digits), group normalisation when the batch is too small for batch norm, and transfer learning, in which early layers transfer well and late layers are task-specific; frozen batch-norm layers must stay in eval mode.
- Detection predicts boxes: IoU measures overlap, anchors give the network reference shapes, non-maximum suppression removes duplicates greedily, and average precision summarises the precision-recall curve; one-stage detectors trade some accuracy for speed, and focal loss counters the flood of easy background anchors.
- Segmentation labels every pixel. A U-Net's encoder gathers context, its decoder restores resolution, and concatenated skips return the detail that boundaries need; Dice and IoU, related by $D = 2J/(1+J)$, are used because pixel accuracy rewards predicting the background (99.4% accuracy and Dice 0 when 0.6% of pixels are foreground).
- The same machinery runs in one and three dimensions. A mask becomes a measurement only through its voxel spacing, so the spacing travels with the data, and the measured surface and volume carry an error budget (an anisotropic ellipsoid read at the wrong spacing reports twice the true volume).
- Saliency maps and Grad-CAM show which input regions a classifier's output depends on, not why; Grad-CAM, with weights $\alpha_k^c = \frac{1}{Z}\sum_{i,j}\partial y^c/\partial A^k_{ij}$, exposed a classifier that relied on a spurious cue in Lab 6, and sanity checks are needed before anyone trusts a map.

[Module 04](module_04_EN.html) keeps the idea that made convolution work, sharing weights across positions, and applies it along time instead of space: a recurrent network reuses the same weights at every step, so its gradients are products of the same matrix many times, the vanishing and exploding behaviour you measured in Lab 3 in a different guise. The 1D convolutions of [Section 13](#s13) are the bridge, and Module 04 compares them with recurrence directly. [Module 06](module_06_EN.html) then replaces fixed local windows by attention that chooses its neighbours, and its transformer block reuses the residual connection of [Section 8](#s8) unchanged.

## References {#refs}

- LeCun, Y., Bottou, L., Bengio, Y., Haffner, P. "Gradient-based learning applied to document recognition." *Proceedings of the IEEE*, 1998. LeNet-5; the parameter and connection counts of [Section 7](#s7).
- Krizhevsky, A., Sutskever, I., Hinton, G. E. "ImageNet classification with deep convolutional neural networks." *NeurIPS*, 2012. AlexNet.
- Russakovsky, O. et al. "ImageNet large scale visual recognition challenge." *International Journal of Computer Vision*, 2015. How the ILSVRC numbers are defined.
- Simonyan, K., Zisserman, A. "Very deep convolutional networks for large-scale image recognition." *ICLR*, 2015. VGG.
- Lin, M., Chen, Q., Yan, S. "Network in network." *ICLR*, 2014. 1 × 1 convolutions and global average pooling.
- Szegedy, C. et al. "Going deeper with convolutions." *CVPR*, 2015. GoogLeNet and the inception module.
- He, K., Zhang, X., Ren, S., Sun, J. "Deep residual learning for image recognition." *CVPR*, 2016. ResNet; guided reading.
- He, K., Zhang, X., Ren, S., Sun, J. "Identity mappings in deep residual networks." *ECCV*, 2016. Pre-activation blocks and the gradient derivation of [Section 8](#s8).
- Goyal, P. et al. "Accurate, large minibatch SGD: Training ImageNet in 1 hour." *arXiv*, 2017. Zero-initialising the last batch-norm scale of each residual branch.
- Xie, S., Girshick, R., Dollár, P., Tu, Z., He, K. "Aggregated residual transformations for deep neural networks." *CVPR*, 2017. ResNeXt and grouped convolutions.
- Huang, G., Liu, Z., van der Maaten, L., Weinberger, K. Q. "Densely connected convolutional networks." *CVPR*, 2017. DenseNet.
- Howard, A. G. et al. "MobileNets: Efficient convolutional neural networks for mobile vision applications." *arXiv*, 2017. Depthwise-separable networks and the cost formula.
- Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., Chen, L.-C. "MobileNetV2: Inverted residuals and linear bottlenecks." *CVPR*, 2018. Inverted residual blocks.
- Tan, M., Le, Q. V. "EfficientNet: Rethinking model scaling for convolutional neural networks." *ICML*, 2019. Compound scaling; the numbers quoted are from Table 2 of the ICML version (a later arXiv revision reports EfficientNet-B0 at 77.1%).
- Liu, Z., Mao, H., Wu, C.-Y., Feichtenhofer, C., Darrell, T., Xie, S. "A ConvNet for the 2020s." *CVPR*, 2022. ConvNeXt; the recipe-versus-architecture roadmap (Figure 2, with every step's value in Table 10, Appendix C of the arXiv version; ConvNeXt-T in Table 1).
- Dosovitskiy, A. et al. "An image is worth 16x16 words: Transformers for image recognition at scale." *ICLR*, 2021. The vision transformer; see [Module 06](module_06_EN.html).
- Wu, Y., He, K. "Group normalization." *ECCV*, 2018. Normalisation over channel groups, independent of batch size.
- Zhang, H., Cisse, M., Dauphin, Y. N., Lopez-Paz, D. "mixup: Beyond empirical risk minimization." *ICLR*, 2018. Augmentation by convex combinations of examples and labels.
- Yun, S. et al. "CutMix: Regularization strategy to train strong classifiers with localizable features." *ICCV*, 2019. Augmentation by pasting patches between images.
- Yosinski, J., Clune, J., Bengio, Y., Lipson, H. "How transferable are features in deep neural networks?" *NeurIPS*, 2014. General early layers, specific late layers ([Lab 4](#lab4)).
- He, K., Girshick, R., Dollár, P. "Rethinking ImageNet pre-training." *ICCV*, 2019. Training from scratch can match pretraining given enough data and time.
- Raghu, M., Zhang, C., Kleinberg, J., Bengio, S. "Transfusion: Understanding transfer learning for medical imaging." *NeurIPS*, 2019. How much of ImageNet transfer survives in medical imaging.
- Girshick, R., Donahue, J., Darrell, T., Malik, J. "Rich feature hierarchies for accurate object detection and semantic segmentation." *CVPR*, 2014. R-CNN.
- Ren, S., He, K., Girshick, R., Sun, J. "Faster R-CNN: Towards real-time object detection with region proposal networks." *NeurIPS*, 2015. Anchors and the region proposal network.
- Redmon, J., Divvala, S., Girshick, R., Farhadi, A. "You only look once: Unified, real-time object detection." *CVPR*, 2016. YOLO.
- Liu, W. et al. "SSD: Single shot multibox detector." *ECCV*, 2016. One-stage detection with multi-scale anchors.
- Lin, T.-Y., Goyal, P., Girshick, R., He, K., Dollár, P. "Focal loss for dense object detection." *ICCV*, 2017. RetinaNet and the focal loss.
- Bodla, N., Singh, B., Chellappa, R., Davis, L. S. "Soft-NMS: Improving object detection with one line of code." *ICCV*, 2017. Decaying scores instead of deleting boxes.
- Carion, N. et al. "End-to-end object detection with transformers." *ECCV*, 2020. DETR; detection without anchors or NMS.
- He, K., Gkioxari, G., Dollár, P., Girshick, R. "Mask R-CNN." *ICCV*, 2017. Instance segmentation.
- Everingham, M. et al. "The PASCAL visual object classes (VOC) challenge." *International Journal of Computer Vision*, 2010. Average precision at IoU 0.5.
- Lin, T.-Y. et al. "Microsoft COCO: Common objects in context." *ECCV*, 2014. Average precision averaged over IoU thresholds.
- Long, J., Shelhamer, E., Darrell, T. "Fully convolutional networks for semantic segmentation." *CVPR*, 2015. Dense prediction with convolutional networks.
- Ronneberger, O., Fischer, P., Brox, T. "U-Net: Convolutional networks for biomedical image segmentation." *MICCAI*, 2015. Guided reading.
- Çiçek, Ö., Abdulkadir, A., Lienkamp, S. S., Brox, T., Ronneberger, O. "3D U-Net: Learning dense volumetric segmentation from sparse annotation." *MICCAI*, 2016. The 3D extension.
- Milletari, F., Navab, N., Ahmadi, S.-A. "V-Net: Fully convolutional neural networks for volumetric medical image segmentation." *3DV*, 2016. The Dice loss.
- Odena, A., Dumoulin, V., Olah, C. "Deconvolution and checkerboard artifacts." *Distill*, 2016. Why transposed convolutions leave checkerboard patterns.
- Dumoulin, V., Visin, F. "A guide to convolution arithmetic for deep learning." *arXiv*, 2016. Output sizes for convolutions and transposed convolutions, with diagrams.
- Yu, F., Koltun, V. "Multi-scale context aggregation by dilated convolutions." *ICLR*, 2016. Dilated convolution for dense prediction.
- van den Oord, A. et al. "WaveNet: A generative model for raw audio." *arXiv*, 2016. Dilated causal convolutions.
- Bai, S., Kolter, J. Z., Koltun, V. "An empirical evaluation of generic convolutional and recurrent networks for sequence modeling." *arXiv*, 2018. Temporal convolutional networks.
- Lorensen, W. E., Cline, H. E. "Marching cubes: A high resolution 3D surface construction algorithm." *SIGGRAPH*, 1987. The isosurface algorithm of [Section 13](#s13).
- Luo, W., Li, Y., Urtasun, R., Zemel, R. "Understanding the effective receptive field in deep convolutional neural networks." *NeurIPS*, 2016. Why the effective receptive field is smaller than the theoretical one.
- Zhang, R. "Making convolutional networks shift-invariant again." *ICML*, 2019. Anti-aliased downsampling.
- Azulay, A., Weiss, Y. "Why do deep convolutional networks generalize so poorly to small image transformations?" *Journal of Machine Learning Research*, 2019. Measured loss of shift invariance.
- Zeiler, M. D., Fergus, R. "Visualizing and understanding convolutional networks." *ECCV*, 2014. Visualising what feature maps respond to.
- Simonyan, K., Vedaldi, A., Zisserman, A. "Deep inside convolutional networks: Visualising image classification models and saliency maps." *ICLR Workshop*, 2014. Gradient saliency maps.
- Zhou, B., Khosla, A., Lapedriza, A., Oliva, A., Torralba, A. "Learning deep features for discriminative localization." *CVPR*, 2016. Class activation maps.
- Selvaraju, R. R. et al. "Grad-CAM: Visual explanations from deep networks via gradient-based localization." *ICCV*, 2017. Gradient-weighted class activation maps.
- Adebayo, J. et al. "Sanity checks for saliency maps." *NeurIPS*, 2018. Randomisation tests that some saliency methods fail.
- Geirhos, R. et al. "ImageNet-trained CNNs are biased towards texture; increasing shape bias improves accuracy and robustness." *ICLR*, 2019. Texture bias.
- Geirhos, R. et al. "Shortcut learning in deep neural networks." *Nature Machine Intelligence*, 2020. Shortcut learning as a general failure mode.
- Zech, J. R. et al. "Variable generalization performance of a deep learning model to detect pneumonia in chest radiographs: A cross-sectional study." *PLOS Medicine*, 2018. A classifier that used site-specific cues.
- Keshav, S. "How to read a paper." *ACM SIGCOMM Computer Communication Review*, 2007. The three-pass method.
- Goodfellow, I., Bengio, Y., Courville, A. *Deep Learning*. MIT Press, 2016. Chapter 9, convolutional networks.
- Zhang, A., Lipton, Z. C., Li, M., Smola, A. J. *Dive into Deep Learning*. The chapters on convolutional networks and modern CNNs; code-first and kept current.
