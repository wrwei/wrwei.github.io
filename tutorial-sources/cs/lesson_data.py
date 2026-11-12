"""Small authoring helpers; all instructional text is supplied by lesson authors."""
def P(en, zh):
    return en, zh


def S(en_title, zh_title, en_body, zh_body, en_question, zh_question, en_answer, zh_answer):
    return P(en_title, zh_title), P(en_body, zh_body), P(en_question, zh_question), P(en_answer, zh_answer)


def E(stars, en_title, zh_title, en_question, zh_question, en_answer, zh_answer):
    return stars, P(en_title, zh_title), P(en_question, zh_question), P(en_answer, zh_answer)


def Q(en_question, zh_question, en_right, zh_right, en_wrong1, zh_wrong1, en_wrong2, zh_wrong2, en_reason, zh_reason):
    return P(en_question, zh_question), [P(en_right, zh_right), P(en_wrong1, zh_wrong1), P(en_wrong2, zh_wrong2)], 0, P(en_reason, zh_reason)


def finish(data):
    # Spread correct choices among A, B and C while preserving bilingual alignment.
    data["quiz"] = [(q, options[-i % 3:] + options[:-i % 3] if i % 3 else options, i % 3, why)
                    for i, (q, options, _, why) in enumerate(data["quiz"])]
    return data
